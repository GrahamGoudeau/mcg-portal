package postgres

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/lib/pq"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/dao"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/accounts/enrollment"
	"portal.mcgyouthandarts.org/pkg/services/approvals"
	"portal.mcgyouthandarts.org/pkg/services/events"
	"portal.mcgyouthandarts.org/pkg/services/jobs"
	"portal.mcgyouthandarts.org/pkg/services/resources"
)

type Dao struct {
	db     *sql.DB
	logger *zap.SugaredLogger
}

type Opts struct {
	MaxOpenCons           int
	MaxIdleCons           int
	MaxConLifetimeMinutes int
	DbUrl                 string
}

func NewDao(opts Opts, logger *zap.SugaredLogger) *Dao {
	db, err := sql.Open("postgres", opts.DbUrl)
	if err != nil {
		panic(err)
	}

	db.SetMaxOpenConns(opts.MaxOpenCons)
	db.SetMaxIdleConns(opts.MaxIdleCons)
	db.SetConnMaxLifetime(time.Duration(opts.MaxConLifetimeMinutes) * time.Minute)

	if err := db.Ping(); err != nil {
		panic(err)
	}

	return &Dao{
		db:     db,
		logger: logger,
	}
}

func (d *Dao) CreateAccountRegistration(email, hashedPassword, firstName, lastName string, enrollmentStatus *enrollment.Type) (approvalRequestIdRet int64, status accounts.RegistrationStatus, err error) {
	type result struct {
		approvalRequestId int64
		failureReason     accounts.RegistrationStatus
	}
	regStats, err := d.runInTransaction(func(tx *sql.Tx) (interface{}, error) {
		_, err := tx.Exec("lock table account_revisions in exclusive mode;")
		if err != nil {
			d.logger.Errorf("%+v", err)
			return &result{failureReason: accounts.RegistrationErr}, err
		}

		_, err = tx.Exec("lock table account in exclusive mode;")
		if err != nil {
			d.logger.Errorf("%+v", err)
			return &result{failureReason: accounts.RegistrationErr}, err
		}

		row := tx.QueryRow(`
SELECT EXISTS(
	SELECT email FROM account WHERE email = $1
	UNION
		SELECT
			email
		FROM account_revisions revisions JOIN admin_approval_request approvals
		ON revisions.admin_approval_request_id = approvals.id
		WHERE approvals.approval_status = 'Not Reviewed' AND revisions.email = $1
);
`, email)
		isDuplicateEmail := false
		err = row.Scan(&isDuplicateEmail)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return &result{failureReason: accounts.RegistrationErr}, err
		} else if isDuplicateEmail {
			d.logger.Info("Duplicate email attmepted to register")
			return &result{failureReason: accounts.DuplicateEmail}, err
		}

		approvalRequestId, err := d.createAdminApprovalRequest(tx)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return &result{failureReason: accounts.RegistrationErr}, err
		}

		_, err = tx.Exec(`
INSERT INTO account_revisions (
	admin_approval_request_id,
	email,
	password_digest,
	last_name,
	first_name,
	enrollment_type
) VALUES ($1, $2, $3, $4, $5, $6)
`, approvalRequestId, email, hashedPassword, lastName, firstName, enrollmentStatus)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return &result{failureReason: accounts.RegistrationErr}, err
		}

		return &result{approvalRequestId: approvalRequestId, failureReason: accounts.RegistrationOk}, nil
	})

	ret := regStats.(*result)

	return ret.approvalRequestId, ret.failureReason, err
}

func (d *Dao) GetUserCreds(email string) (*accounts.UserCredentials, error) {
	row := d.db.QueryRow(`
SELECT
	acc.id,
	admin.account_id IS NOT NULL AS is_admin,
	acc.password_digest AS password_digest
FROM account acc LEFT JOIN admin_account admin
ON acc.id = admin.account_id
WHERE acc.email = $1 AND NOT acc.deactivated;
`, email)

	creds := &accounts.UserCredentials{}
	err := row.Scan(&creds.Id, &creds.IsAdmin, &creds.HashedPassword)
	if err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	return creds, nil
}

func (d *Dao) DoesUserHavePendingAccountUpdate(userId int64) (hasPendingUpdate bool, err error) {
	row := d.db.QueryRow(`
SELECT EXISTS(
	SELECT 1 FROM account_revisions rev JOIN admin_approval_request approvals
	ON rev.admin_approval_request_id = approvals.id
	WHERE rev.original_account_id = $1 AND approvals.approval_status = 'Not Reviewed' 
);
`, userId)
	err = row.Scan(&hasPendingUpdate)
	if err != nil {
		return false, err
	}

	return hasPendingUpdate, nil
}

func (d *Dao) CancelPendingAccountUpdate(userId int64) error {
	_, err := d.db.Exec(`
UPDATE admin_approval_request SET approval_status = 'Not Applicable'
WHERE id = (
	SELECT admin_approval_request_id FROM account_revisions WHERE original_account_id = $1
);
`, userId)
	return err
}

func (d *Dao) UpdateAccount(
	account *accounts.Account,
	firstName string,
	lastName string,
	enrollmentType *enrollment.Type,
	bio,
	currentRole,
	currentSchool,
	currentCompany string,
) (approvalRequestId int64, err error) {
	_, err = d.runInTransaction(func(tx *sql.Tx) (interface{}, error) {
		approvalRequestId, err = d.createAdminApprovalRequest(tx)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return nil, err
		}

		_, err = tx.Exec(`
INSERT INTO account_revisions (admin_approval_request_id, original_account_id, first_name, last_name, enrollment_type, bio, role, current_school, current_company, email, password_digest)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
`, approvalRequestId, account.UserId, firstName, lastName, enrollmentType, bio, currentRole, currentSchool, currentCompany, account.Email, account.HashedPassword)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return nil, err
		}
		return nil, nil
	})
	return approvalRequestId, err
}

func (d *Dao) RunInTransaction(block func(transaction dao.Transaction) error) error {
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}

	transaction := &transactionInProgress{tx}
	err = block(transaction)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (d *Dao) runInTransaction(block func(tx *sql.Tx) (interface{}, error)) (interface{}, error) {
	tx, err := d.db.Begin()
	if err != nil {
		return nil, err
	}

	result, err := block(tx)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	return result, tx.Commit()
}

func (d *Dao) createAdminApprovalRequest(tx *sql.Tx) (approvalId int64, err error) {
	row := tx.QueryRow(`
insert into admin_approval_request (id) values (DEFAULT) RETURNING id;
`)
	err = row.Scan(&approvalId)
	return approvalId, err
}

func (d *Dao) GetAccount(userId int64) (*accounts.Account, error) {
	row := d.db.QueryRow(`
SELECT id, email, password_digest, first_name, last_name, enrollment_type, bio, role, current_school, current_company FROM account WHERE id = $1;
`, userId)
	account := accounts.Account{}
	err := row.Scan(
		&account.UserId,
		&account.Email,
		&account.HashedPassword,
		&account.FirstName,
		&account.LastName,
		&account.EnrollmentType,
		&account.Bio,
		&account.CurrentRole,
		&account.CurrentSchool,
		&account.CurrentCompany,
	)

	return &account, err
}

func (d *Dao) SetStatusOnRequest(tx dao.Transaction, respondingAdmin int64, requestId int64, response approvals.ApprovalResponse) error {
	_, err := tx.GetPostgresTransaction().Exec(`
UPDATE admin_approval_request SET approval_status = $1, approved_by = $2, approved_at = NOW() WHERE id = $3;
`, string(response), respondingAdmin, requestId)
	return err
}

func (d *Dao) GetRequestMetadata(tx dao.Transaction, requestId int64) (*approvals.ApprovalRequestMetadata, error) {
	row := tx.GetPostgresTransaction().QueryRow(`
SELECT
	$1 IN (SELECT admin_approval_request_id FROM account_revisions) AS is_account,
	$1 IN (SELECT admin_approval_request_id FROM connection_request) AS is_connection,
	$1 IN (SELECT admin_approval_request_id FROM job_posting_revision) AS is_job,
	$1 IN (SELECT admin_approval_request_id FROM event_revision) AS is_event;
`, requestId)
	isAccount := false
	isConnection := false
	isJob := false
	isEvent := false
	err := row.Scan(&isAccount, &isConnection, &isJob, &isEvent)
	if err != nil {
		d.logger.Errorf("%+v")
		return nil, err
	}

	requestType := approvals.ApprovalRequestType("")
	if isAccount {
		requestType = approvals.Account
	} else if isConnection {
		requestType = approvals.Connection
	} else if isJob {
		requestType = approvals.Job
	} else if isEvent {
		requestType = approvals.Event
	} else {
		return nil, errors.New("unhandled request type")
	}

	return &approvals.ApprovalRequestMetadata{
		Id:   requestId,
		Type: requestType,
	}, nil
}

func (d *Dao) ApproveConnection(tx dao.Transaction, metadata *approvals.ApprovalRequestMetadata) (connectionId int64, err error) {
	row := tx.GetPostgresTransaction().QueryRow(`
UPDATE admin_approval_request ar
SET approval_status = 'Approved'
FROM connection_request cr
WHERE ar.id = $1 AND cr.admin_approval_request_id = $1
RETURNING cr.id;
`, metadata.Id)
	err = row.Scan(&connectionId)
	if err != nil {
		d.logger.Errorf("%+v")
		return -1, err
	}
	return connectionId, nil
}

func (d *Dao) ApproveAccountChange(tx dao.Transaction, metadata *approvals.ApprovalRequestMetadata) (accountId int64, userName string, userEmail string, err error) {
	type rowToTransfer struct {
		accounts.Account
		isNewAccount   bool
		passwordDigest string
	}

	row := tx.GetPostgresTransaction().QueryRow(`
SELECT
original_account_id IS NULL AS is_new, email, password_digest, last_name, first_name, enrollment_type, bio, role, current_school, current_company 
FROM account_revisions WHERE admin_approval_request_id = $1;
`, metadata.Id)
	transferRow := rowToTransfer{}
	err = row.Scan(
		&transferRow.isNewAccount,
		&transferRow.Email,
		&transferRow.passwordDigest,
		&transferRow.LastName,
		&transferRow.FirstName,
		&transferRow.EnrollmentType,
		&transferRow.Bio,
		&transferRow.CurrentRole,
		&transferRow.CurrentSchool,
		&transferRow.CurrentCompany,
	)
	if err != nil {
		d.logger.Errorf("%+v")
		return 0, "", "", err
	}

	if transferRow.isNewAccount {
		d.logger.Infof("Account is brand new for request %d", metadata.Id)
		idRow := tx.GetPostgresTransaction().QueryRow(`
INSERT INTO account (email, password_digest, last_name, first_name, enrollment_type, bio, role, current_school, current_company) VALUES (
$1, $2, $3, $4, $5, $6, $7, $8, $9
) RETURNING id, first_name, last_name, email;
`, transferRow.Email, transferRow.passwordDigest, transferRow.LastName, transferRow.FirstName, transferRow.EnrollmentType.ConvertToNillableString(), transferRow.Bio, transferRow.CurrentRole, transferRow.CurrentSchool, transferRow.CurrentCompany)

		firstName := ""
		lastName := ""
		err = idRow.Scan(&accountId, &firstName, &lastName, &userEmail)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return -1, "", "", err
		}
		return accountId, fmt.Sprintf("%s %s", firstName, lastName), userEmail, nil
	} else {
		d.logger.Infof("Account already exists for request %d", metadata.Id)
		idRow := tx.GetPostgresTransaction().QueryRow(`
UPDATE account SET last_name = $1, first_name = $2, enrollment_type = $3, bio = $4, role = $5, current_school = $6, current_company = $7
WHERE email = $8
RETURNING id, first_name, last_name, email;
`, transferRow.LastName, transferRow.FirstName, transferRow.EnrollmentType.ConvertToNillableString(), transferRow.Bio, transferRow.CurrentRole, transferRow.CurrentSchool, transferRow.CurrentCompany, transferRow.Email)

		firstName := ""
		lastName := ""
		err = idRow.Scan(&accountId, &firstName, &lastName, &userEmail)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return 0, "", "", err
		}
		return accountId, fmt.Sprintf("%s %s", firstName, lastName), userEmail, nil
	}
}

func (d *Dao) ApproveJobChange(transaction dao.Transaction, metadata *approvals.ApprovalRequestMetadata) (jobId int64, err error) {
	type rowToTransfer struct {
		isNewJob    bool
		originalId  int64
		posterId    int64
		title       string
		postedAt    time.Time
		description string
		location    string
	}
	tx := transaction.GetPostgresTransaction()

	rs := tx.QueryRow(`
SELECT
	original_id IS NULL,
	COALESCE(original_id, -1),
	poster_id,
	title,
	post_time,
	description,
	location
FROM job_posting_revision
WHERE admin_approval_request_id = $1;
`, metadata.Id)

	row := rowToTransfer{}
	err = rs.Scan(
		&row.isNewJob,
		&row.originalId,
		&row.posterId,
		&row.title,
		&row.postedAt,
		&row.description,
		&row.location,
	)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return -1, err
	}

	if row.isNewJob {
		rs = tx.QueryRow(`
INSERT INTO job_posting (poster_id, title, post_time, description, location)
VALUES ($1, $2, $3, $4, $5) RETURNING id;
`, row.posterId, row.title, row.postedAt, row.description, row.location)
		err = rs.Scan(&jobId)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return -1, err
		}
		return jobId, nil
	} else {
		_, err = tx.Exec(`
UPDATE job_posting
SET poster_id = $1, title = $2, post_time = $3, description = $4, location = $5
WHERE id = $6;
`, row.posterId, row.title, row.postedAt, row.description, row.location, row.originalId)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return -1, err
		}
		return row.originalId, nil
	}
}

func (d *Dao) ApproveEventChange(transaction dao.Transaction, metadata *approvals.ApprovalRequestMetadata) (eventId int64, err error) {
	type rowToTransfer struct {
		isNewEvent  bool
		originalId  int64
		name        string
		organizerId int64
		description string
		eventTime   time.Time
	}
	tx := transaction.GetPostgresTransaction()

	rs := tx.QueryRow(`
SELECT
	original_id IS NULL,
	COALESCE(original_id, -1),
	name,
	organizer_id,
	description,
	time
FROM event_revision
WHERE admin_approval_request_id = $1;
`, metadata.Id)

	row := rowToTransfer{}
	err = rs.Scan(
		&row.isNewEvent,
		&row.originalId,
		&row.name,
		&row.organizerId,
		&row.description,
		&row.eventTime,
	)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return -1, err
	}

	if row.isNewEvent {
		rs = tx.QueryRow(`
INSERT INTO event (name, organizer_id, description, time)
VALUES ($1, $2, $3, $4) RETURNING id;
`, row.name, row.organizerId, row.description, row.eventTime)
		err = rs.Scan(&eventId)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return -1, err
		}
		return eventId, nil
	} else {
		_, err = tx.Exec(`
UPDATE event
SET name = $1, organizer_id = $2, description = $3, time = $4
WHERE id = $6;
`, row.name, row.organizerId, row.description, row.eventTime)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return -1, err
		}
		return row.originalId, nil
	}
}

func (d *Dao) GetAllRequests() ([]*approvals.ApprovalRequest, error) {
	rows, err := d.db.Query(`
SELECT
	aar.id,
	
	COALESCE(ar.id, -1),
	COALESCE(ar.email, ''),
	COALESCE(ar.last_name, ''),
	COALESCE(ar.first_name, ''),
	COALESCE(ar.enrollment_type, 'Alum'), -- this is a garbage value, only accessed if this row exists
	COALESCE(ar.bio, ''),
	COALESCE(ar.role, ''),
	COALESCE(ar.current_school, ''),
	COALESCE(ar.current_company, ''),
	ar.original_account_id IS NULL AS is_new_account,
	
	COALESCE(er.id, -1),
	COALESCE(er.name, ''),
	COALESCE(ea.first_name, ''),
	COALESCE(ea.last_name, ''),
	COALESCE(ea.email, ''),
	COALESCE(er.time, NOW()::TIMESTAMPTZ),
	er.original_id IS NULL AS is_new_event,
	COALESCE(er.description, '') AS event_description,
	
	COALESCE(cr.id, -1),
	COALESCE(cr_requester.first_name, ''),
	COALESCE(cr_requester.last_name, ''),
	COALESCE(cr_requester.email, ''),
	COALESCE(cr_requestee.first_name, ''),
	COALESCE(cr_requestee.last_name, ''),
	COALESCE(cr_requestee.email, ''),
	
	COALESCE(jpr.id, -1),
	jpr.original_id IS NULL AS is_new_job,
	COALESCE(jpr.title, ''),
	COALESCE(jpr.post_time, CURRENT_DATE),
	COALESCE(jpr.description, ''),
	COALESCE(jpr.location, ''),
	COALESCE(jpa.first_name || ' ' || jpa.last_name, '')
	
FROM admin_approval_request aar
LEFT JOIN account_revisions ar ON ar.admin_approval_request_id = aar.id
LEFT JOIN account a ON ar.original_account_id = a.id
LEFT JOIN event_revision er ON er.admin_approval_request_id = aar.id
LEFT JOIN account ea ON ea.id = er.organizer_id
LEFT JOIN connection_request cr ON cr.admin_approval_request_id = aar.id
LEFT JOIN account cr_requester ON cr.requester_id = cr_requester.id
LEFT JOIN account cr_requestee ON cr.requestee_id = cr_requestee.id
LEFT JOIN job_posting_revision jpr ON jpr.admin_approval_request_id = aar.id
LEFT JOIN account jpa ON jpa.id = jpr.poster_id
WHERE aar.approval_status = 'Not Reviewed'
ORDER BY aar.id ASC;
`)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return nil, err
	}
	var result []*approvals.ApprovalRequest
	defer rows.Close()
	for {
		if rows.Next() {
			next := approvals.ApprovalRequest{}

			approvalRequestId := int64(0)
			accountRevisionId := int64(0)
			accountEmail := ""
			accountRevisionLastName := ""
			accountRevisionFirstName := ""
			enrollmentType := enrollment.Type("")
			bio := ""
			role := ""
			currentSchool := ""
			currentCompany := ""
			isNewAccount := false

			eventRequestId := int64(0)
			eventName := ""
			eventOrganizerFirstName := ""
			eventOrganizerLastName := ""
			eventOrganizerEmail := ""
			eventTime := time.Time{}
			isNewEvent := false
			eventDescription := ""

			connectionRequestId := int64(0)
			requesterFirstName := ""
			requesterLastName := ""
			requesterEmail := ""
			requesteeFirstName := ""
			requesteeLastName := ""
			requesteeEmail := ""

			jobRequestId := int64(0)
			isNewJob := false
			jobTitle := ""
			jobPostTime := time.Time{}
			jobDescription := ""
			jobLocation := ""
			jobPosterName := ""

			err = rows.Scan(
				&approvalRequestId,

				&accountRevisionId,
				&accountEmail,
				&accountRevisionLastName,
				&accountRevisionFirstName,
				&enrollmentType,
				&bio,
				&role,
				&currentSchool,
				&currentCompany,
				&isNewAccount,

				&eventRequestId,
				&eventName,
				&eventOrganizerFirstName,
				&eventOrganizerLastName,
				&eventOrganizerEmail,
				&eventTime,
				&isNewEvent,
				&eventDescription,

				&connectionRequestId,
				&requesterFirstName,
				&requesterLastName,
				&requesterEmail,
				&requesteeFirstName,
				&requesteeLastName,
				&requesteeEmail,

				&jobRequestId,
				&isNewJob,
				&jobTitle,
				&jobPostTime,
				&jobDescription,
				&jobLocation,
				&jobPosterName,
			)
			if err != nil {
				d.logger.Errorf("%+v", err)
				return nil, err
			}

			next.Metadata = &approvals.ApprovalRequestMetadata{
				Id: approvalRequestId,
			}
			if accountRevisionId > 0 {
				enrollmentTypeToReport := (*enrollment.Type)(nil)
				if enrollmentType != "" {
					enrollmentTypeToReport = &enrollmentType
				}
				next.Metadata.Type = approvals.Account
				next.Account = &approvals.AccountRequest{
					Account: &accounts.Account{
						FirstName:      accountRevisionFirstName,
						LastName:       accountRevisionLastName,
						Email:          accountEmail,
						EnrollmentType: enrollmentTypeToReport,
						Bio:            &bio,
						CurrentRole:    &role,
						CurrentSchool:  &currentSchool,
						CurrentCompany: &currentCompany,
					},
					IsNewAccount: isNewAccount,
				}
			} else if eventRequestId > 0 {
				next.Metadata.Type = approvals.Event
				next.Event = &approvals.EventRequest{
					Name: eventName,
					OrganizerName: approvals.Name{
						FirstName: eventOrganizerFirstName,
						LastName:  eventOrganizerLastName,
					},
					OrganizerEmail: eventOrganizerEmail,
					Time:           eventTime,
					IsNewEvent:     isNewEvent,
					Description:    eventDescription,
				}
			} else if connectionRequestId > 0 {
				next.Metadata.Type = approvals.Connection
				next.Connection = &approvals.ConnectionRequest{
					RequesteeName: approvals.Name{
						FirstName: requesteeFirstName,
						LastName:  requesteeLastName,
					},
					RequesteeEmail: requesteeEmail,
					RequesterName: approvals.Name{
						FirstName: requesterFirstName,
						LastName:  requesterLastName,
					},
					RequesterEmail: requesterEmail,
				}
			} else if jobRequestId > 0 {
				next.Metadata.Type = approvals.Job
				next.Job = &approvals.JobRequest{
					IsNewJob:    isNewJob,
					Title:       jobTitle,
					PostedAt:    jobPostTime,
					Description: jobDescription,
					Location:    jobLocation,
					Poster:      jobPosterName,
				}
			} else {
				d.logger.Errorf("Unhandled case when loading admin approval requests")
				continue
			}
			result = append(result, &next)
		} else {
			break
		}
	}

	return result, nil
}

func (d *Dao) SubmitConnectionRequest(transaction dao.Transaction, requesterId, requesteeId int64) (approvalRequestIdValue int64, err error) {
	tx := transaction.GetPostgresTransaction()
	approvalRequestId, err := d.createAdminApprovalRequest(tx)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return -1, err
	}

	_, err = tx.Exec(`
INSERT INTO connection_request (admin_approval_request_id, requester_id, requestee_id)
VALUES ($1, $2, $3);
`, approvalRequestId, requesterId, requesteeId)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return -1, err
	}
	return approvalRequestId, nil
}

func (d *Dao) GetResourcesForUser(userId int64) ([]*resources.Resource, error) {
	rows, err := d.db.Query(`
SELECT id, name FROM resource WHERE provider_id = $1 AND NOT is_deleted;
`, userId)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return nil, err
	}
	defer rows.Close()

	var result []*resources.Resource
	for {
		if rows.Next() {
			resource := resources.Resource{}
			err = rows.Scan(&resource.Id, &resource.Name)
			if err != nil {
				d.logger.Errorf("%+v", err)
				return nil, err
			}
			result = append(result, &resource)
		} else {
			break
		}
	}
	return result, nil
}

func (d *Dao) DeleteResourceFromUser(userId, resourceId int64) error {
	_, err := d.db.Exec(`
UPDATE resource SET is_deleted = TRUE WHERE provider_id = $1 AND id = $2;
`, userId, resourceId)
	if err != nil {
		d.logger.Errorf("%+v", err)
	}
	return err
}

func (d *Dao) GetUsersOfferingResources() (ret []*resources.UserOfferingResources, err error) {
	var userIdToResources map[int64]*resources.UserOfferingResources

	rows, err := d.db.Query(`
SELECT
	a.id,
	a.first_name,
	a.last_name,
	COALESCE(a.enrollment_type::TEXT, ''),
	r.id,
	r.name
FROM account a JOIN resource r ON r.provider_id = a.id
WHERE NOT r.is_deleted;
`)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		userId := int64(0)
		firstName := ""
		lastName := ""
		resourceId := int64(0)
		resourceName := ""
		enrollmentTypeStr := ""

		err = rows.Scan(
			&userId,
			&firstName,
			&lastName,
			&enrollmentTypeStr,
			&resourceId,
			&resourceName,
		)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return nil, err
		}

		nextResource := &resources.Resource{
			Id:   resourceId,
			Name: resourceName,
		}
		if mapEntry, ok := userIdToResources[userId]; ok {
			mapEntry.Resources = append(mapEntry.Resources, nextResource)
		} else {
			if userIdToResources == nil {
				userIdToResources = map[int64]*resources.UserOfferingResources{}
			}
			userIdToResources[userId] = &resources.UserOfferingResources{
				UserId:      userId,
				FirstName:   firstName,
				LastInitial: string([]byte(lastName)[0]),
				Resources:   []*resources.Resource{nextResource},
			}

			if enrollmentTypeStr != "" {
				val := enrollment.Type(enrollmentTypeStr)
				userIdToResources[userId].EnrollmentType = &val
			}
		}
	}

	for _, value := range userIdToResources {
		ret = append(ret, value)
	}

	return ret, nil
}

func (d *Dao) GetAllJobs() (ret []*jobs.Job, err error) {
	rows, err := d.db.Query(`
SELECT
	j.id,
	j.title,
	j.post_time,
	j.description,
	j.location,
	
	a.id,
	a.first_name,
	a.last_name,
	COALESCE(a.enrollment_type::TEXT, '')
FROM job_posting j JOIN account a ON j.poster_id = a.id;
`)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		enrollmentStatus := ""
		nextJob := jobs.Job{
			Details: &jobs.JobDetails{},
			Poster:  &jobs.JobPoster{},
		}
		err = rows.Scan(
			&nextJob.Details.JobId,
			&nextJob.Details.Title,
			&nextJob.Details.PostedAt,
			&nextJob.Details.Description,
			&nextJob.Details.Location,
			&nextJob.Poster.PosterId,
			&nextJob.Poster.PosterFirstName,
			&nextJob.Poster.PosterLastName,
			&enrollmentStatus,
		)

		if enrollmentStatus != "" {
			val := enrollment.Type(enrollmentStatus)
			nextJob.Poster.EnrollmentType = &val
		}

		ret = append(ret, &nextJob)
	}

	return ret, err
}

func (d *Dao) GetJobById(jobId int64) (*jobs.Job, error) {
	return nil, nil
}

func (d *Dao) CreateJob(transaction dao.Transaction, posterId int64, title, description, location string) (approvalRequestId int64, err error) {
	tx := transaction.GetPostgresTransaction()
	approvalRequestId, err = d.createAdminApprovalRequest(tx)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return -1, err
	}

	_, err = tx.Exec(`
INSERT INTO job_posting_revision (admin_approval_request_id, poster_id, title, post_time, description, location)
VALUES ($1, $2, $3, CURRENT_DATE, $4, $5);
`, approvalRequestId, posterId, title, description, location)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return -1, err
	}

	return approvalRequestId, nil
}

func (d *Dao) GetAllEvents() (allEvents []*events.Event, err error) {
	rows, err := d.db.Query(`
SELECT
	e.id,
	e.name,
	e.organizer_id,
	a.first_name,
	a.last_name,
	e.description,
	e.time
FROM event e JOIN account a ON e.organizer_id = a.id; 
`)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		nextEvent := events.Event{}
		err = rows.Scan(
			&nextEvent.Id,
			&nextEvent.Name,
			&nextEvent.OrganizerId,
			&nextEvent.OrganizerFirstName,
			&nextEvent.OrganizerLastName,
			&nextEvent.Description,
			&nextEvent.Time,
		)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return nil, err
		}
		allEvents = append(allEvents, &nextEvent)
	}
	return allEvents, nil
}

func (d *Dao) CreateEvent(transaction dao.Transaction, organizerId int64, description string, eventName string, eventTime time.Time) (approvalRequestId int64, err error) {
	tx := transaction.GetPostgresTransaction()
	approvalRequestId, err = d.createAdminApprovalRequest(tx)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return -1, err
	}

	_, err = tx.Exec(`
INSERT INTO event_revision (admin_approval_request_id, name, organizer_id, description, time)
VALUES ($1, $2, $3, $4, $5)
`, approvalRequestId, eventName, organizerId, description, eventTime)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return -1, err
	}
	return approvalRequestId, nil
}

func (d *Dao) RecordLogIn(userId int64) error {
	_, err := d.db.Exec(`
INSERT INTO user_login VALUES ($1, CURRENT_DATE)
ON CONFLICT DO NOTHING;
`, userId)
	return err
}

func (d *Dao) CreateResourceForUser(userId int64, resourceName string) error {
	_, err := d.db.Exec(`
INSERT INTO resource (name, provider_id) VALUES ($1, $2);
`, resourceName, userId)
	if err != nil {
		d.logger.Errorf("%+v", err)
	}
	return err
}

func (d *Dao) HasUserSignedInBefore(userId int64) (answer bool, err error) {
	row := d.db.QueryRow(`
SELECT EXISTS(
	SELECT 1 FROM user_login WHERE user_id = $1
);
`, userId)
	err = row.Scan(&answer)
	if err != nil {
		d.logger.Errorf("%+v", err)
		return false, err
	}
	return answer, err
}

func (d *Dao) IsTokenValid(transaction dao.Transaction, token string) (userIdForToken int64, isValid bool, err error) {
	tx := transaction.GetPostgresTransaction()
	row := tx.QueryRow(`
SELECT
	t.valid_until > NOW() AND NOT t.has_been_used,
	a.id
FROM password_reset_token t JOIN account a ON t.user_id = a.id
WHERE t.token = $1;
`, token)
	err = row.Scan(&isValid, &userIdForToken)
	if err == sql.ErrNoRows {
		return -1, false, nil
	} else if err != nil {
		d.logger.Errorf("%+v", err)
		return -1, false, err
	}
	return userIdForToken, isValid, nil
}

func (d *Dao) SetAccountPassword(transaction dao.Transaction, userId int64, hashedPassword string) error {
	tx := transaction.GetPostgresTransaction()
	_, err := tx.Exec(`
UPDATE account SET password_digest = $1 WHERE id = $2;
`, hashedPassword, userId)
	return err
}

func (d *Dao) InvalidateToken(transaction dao.Transaction, token string) error {
	tx := transaction.GetPostgresTransaction()
	_, err := tx.Exec(`
UPDATE password_reset_token SET has_been_used = TRUE WHERE token = $1;
`, token)
	return err
}

func (d *Dao) CreatePasswordResetToken(email string) (string, error) {
	row := d.db.QueryRow(`
INSERT INTO password_reset_token 
VALUES (
	uuid_in(md5(random()::text || clock_timestamp()::text)::cstring),
	(SELECT id FROM account WHERE email = $1),
	DEFAULT
) RETURNING token;
`, email)
	token := ""
	err := row.Scan(&token)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code.Name() == "not_null_violation" {
				// don't log here- return empty string ot indicate failure
				return "", nil
			}
		}
		d.logger.Errorf("%+v", err)
		return "", err
	}
	return token, nil
}

func (d *Dao) IsAccountDeactivated(userId int64) (answer bool, err error) {
	row := d.db.QueryRow(`
SELECT deactivated FROM account WHERE id = $1;
`, userId)
	err = row.Scan(&answer)
	if err != nil {
		d.logger.Errorf("%+v", err)
	}
	return answer, err
}
