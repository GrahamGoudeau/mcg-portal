package postgres

import (
	"database/sql"
	"errors"
	"time"

	_ "github.com/lib/pq"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/accounts/enrollment"
	"portal.mcgyouthandarts.org/pkg/services/approvals"
	"portal.mcgyouthandarts.org/pkg/services/dao"
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
WHERE acc.email = $1;
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

func (d *Dao) ApproveAccountChange(tx dao.Transaction, metadata *approvals.ApprovalRequestMetadata) (accountId int64, err error) {
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
		return 0, err
	}

	if transferRow.isNewAccount {
		d.logger.Infof("Account is brand new for request %d", metadata.Id)
		idRow := tx.GetPostgresTransaction().QueryRow(`
INSERT INTO account (email, password_digest, last_name, first_name, last_initial, enrollment_type, bio, role, current_school, current_company) VALUES (
$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING id;
`, transferRow.Email, transferRow.passwordDigest, transferRow.LastName, transferRow.FirstName, "X", transferRow.EnrollmentType.ConvertToNillableString(), transferRow.Bio, transferRow.CurrentRole, transferRow.CurrentSchool, transferRow.CurrentCompany)

		err = idRow.Scan(&accountId)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return -1, err
		}
		return accountId, nil
	} else {
		d.logger.Infof("Account already exists for request %d", metadata.Id)
		idRow := tx.GetPostgresTransaction().QueryRow(`
UPDATE account SET last_name = $1, first_name = $2, last_initial = $3, enrollment_type = $4, bio = $5, role = $6, current_school = $7, current_company = $8
WHERE email = $9
RETURNING id;
`, transferRow.LastName, transferRow.FirstName, "X", transferRow.EnrollmentType.ConvertToNillableString(), transferRow.Bio, transferRow.CurrentRole, transferRow.CurrentSchool, transferRow.CurrentCompany, transferRow.Email)
		err = idRow.Scan(&accountId)
		if err != nil {
			d.logger.Errorf("%+v", err)
			return 0, err
		}
		return accountId, nil
	}
}

func (d *Dao) ApproveJobChange(tx dao.Transaction, metadata *approvals.ApprovalRequestMetadata) (jobId int64, err error) {
	return 0, nil
}

func (d *Dao) ApproveEventChange(tx dao.Transaction, metadata *approvals.ApprovalRequestMetadata) (eventId int64, err error) {
	return 0, nil
}
