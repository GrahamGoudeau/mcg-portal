package postgres

import (
	"database/sql"
	"time"

	_ "github.com/lib/pq"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/accounts/enrollment"
)

type Dao struct {
	db *sql.DB
}

type Opts struct {
	MaxOpenCons int
	MaxIdleCons int
	MaxConLifetimeMinutes int
	DbUrl string
}

func New(opts Opts) *Dao {
	db, err := sql.Open("postgres", opts.DbUrl)
	if err != nil {
		panic(err)
	}

	db.SetMaxOpenConns(opts.MaxOpenCons)
	db.SetMaxIdleConns(opts.MaxIdleCons)
	db.SetConnMaxLifetime(time.Duration(opts.MaxConLifetimeMinutes)*time.Minute)

	if err := db.Ping(); err != nil {
		panic(err)
	}

	return &Dao{
		db: db,
	}
}

func (d *Dao) CreateAccountRegistration(email, hashedPassword, firstName, lastName string, enrollmentStatus *enrollment.Type) (accounts.RegistrationStatus, error) {
	regStats, err := d.runInTransaction(func(tx *sql.Tx) (interface{}, error) {
		_, err := tx.Exec("lock table account_revisions in exclusive mode;")
		if err != nil {
			return accounts.RegistrationErr, err
		}

		_, err = tx.Exec("lock table account in exclusive mode;")
		if err != nil {
			return accounts.RegistrationErr, err
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
			return accounts.RegistrationErr, err
		} else if isDuplicateEmail {
			return accounts.DuplicateEmail, nil
		}

		approvalId, err := d.createAdminApprovalRequest(tx)
		if err != nil {
			return accounts.RegistrationErr, err
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
`, approvalId, email, hashedPassword, lastName, firstName, enrollmentStatus)
		if err != nil {
			return accounts.RegistrationErr, err
		}

		return accounts.RegistrationOk, nil
	})

	return regStats.(accounts.RegistrationStatus), err
}

func (d *Dao) GetUserCreds(email string) (*accounts.UserCredentials, error) {
	row := d.db.QueryRow(`
SELECT
	acc.id,
	admin.account_id IS NOT NULL AS is_admin,
	acc.password_digest AS hashed_password
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
	userId int64,
	firstName string,
	lastName string,
	enrollmentType *enrollment.Type,
	bio,
	currentRole,
	currentSchool,
	currentCompany string,
) error {
	_, err := d.runInTransaction(func(tx *sql.Tx) (interface{}, error) {
		approvalId, err := d.createAdminApprovalRequest(tx)
		if err != nil {
			return nil, err
		}

		_, err = tx.Exec(`
INSERT INTO account_revisions (admin_approval_request_id, original_account_id, first_name, last_name, enrollment_type, bio, role, current_school, current_company)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`, approvalId, userId, firstName, lastName, enrollmentType, bio, currentRole, currentSchool, currentCompany)
		return nil, err
	})
	return err
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
SELECT id, email, first_name, last_name, enrollment_type, bio, role, current_school, current_company FROM account WHERE id = $1;
`, userId)
	account := accounts.Account{}
	err := row.Scan(
		&account.UserId,
		&account.Email,
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
