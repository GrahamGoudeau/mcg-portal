package accounts

import (
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/dao"
	"portal.mcgyouthandarts.org/pkg/services/accounts/auth"
	"portal.mcgyouthandarts.org/pkg/services/accounts/enrollment"
	"portal.mcgyouthandarts.org/pkg/services/emailer"
)

type Service interface {
	// returns non-nil credentials if authenticated
	Authenticate(email, password string) (credentials *UserCredentials, err error)
	HasUserSignedInBefore(userId int64) (bool, error)

	CreateAccount(
		email string,
		password string,
		firstName string,
		lastName string,
		enrollmentStatus *enrollment.Type,
	) (approvalRequestId int64, status RegistrationStatus, err error)

	UpdateAccount(
		userId int64,
		firstName string,
		lastName string,
		enrollmentStatus *enrollment.Type,
		bio,
		currentRole,
		currentSchool,
		currentCompany string,
	) (approvalRequestId int64, status UpdateStatus, err error)

	GetAccountFullDetails(userId int64) (*Account, error)
	GetAccountRedacted(userId int64) (*RedactedAccount, error)
	CreatePasswordResetToken(email string)
	ResetPassword(token string, newPassword string) (PasswordResetStatus, error)
}

type Account struct {
	UserId         int64            `json:"userId"`
	Email          string           `json:"email"`
	HashedPassword string           `json:"-"`
	FirstName      string           `json:"firstName"`
	LastName       string           `json:"lastName"`
	EnrollmentType *enrollment.Type `json:"enrollmentType"`
	Bio            *string          `json:"bio"`
	CurrentRole    *string          `json:"currentRole"`
	CurrentSchool  *string          `json:"currentSchool"`
	CurrentCompany *string          `json:"currentCompany"`
}

type RedactedAccount struct {
	FirstName      string           `json:"firstName"`
	LastInitial    string           `json:"lastInitial"`
	EnrollmentType *enrollment.Type `json:"enrollmentType"`
	Bio            *string          `json:"bio"`
	CurrentRole    *string          `json:"currentRole"`
	CurrentSchool  *string          `json:"currentSchool"`
	CurrentCompany *string          `json:"currentCompany"`
}

type AccountsDao interface {
	RunInTransaction(block func(transaction dao.Transaction) error) error
	GetUserCreds(email string) (*UserCredentials, error)

	// returns a registration failure if the cause is known, error for fatal unknown error
	CreateAccountRegistration(email, hashedPassword, firstName, lastName string, enrollmentStatus *enrollment.Type) (approvalRequestId int64, status RegistrationStatus, err error)
	DoesUserHavePendingAccountUpdate(userId int64) (bool, error)
	CancelPendingAccountUpdate(userId int64) error

	UpdateAccount(
		account *Account,
		firstName string,
		lastName string,
		enrollmentType *enrollment.Type,
		bio,
		currentRole,
		currentSchool,
		currentCompany string,
	) (approvalRequestId int64, err error)

	GetAccount(userId int64) (*Account, error)
	HasUserSignedInBefore(userId int64) (bool, error)
	IsTokenValid(transaction dao.Transaction, token string) (userIdForToken int64, isValid bool, err error)
	SetAccountPassword(transaction dao.Transaction, userId int64, hashedPassword string) error
	InvalidateToken(transaction dao.Transaction, token string) error
	CreatePasswordResetToken(email string) (token string, err error)
}

type RegistrationStatus string
type PasswordResetStatus string

const (
	RegistrationOk  RegistrationStatus = "ok"
	DuplicateEmail  RegistrationStatus = "duplicate"
	RegistrationErr RegistrationStatus = "unknown"

	ResetOk  PasswordResetStatus = "ok"
	BadToken PasswordResetStatus = "bad_token"
)

type UpdateStatus string

const (
	UpdateOk  UpdateStatus = "ok"
	UpdateErr UpdateStatus = "unknown"
)

type UserCredentials struct {
	Id             int64
	IsAdmin        bool
	HashedPassword string
}

type accountsService struct {
	dao             AccountsDao
	logger          *zap.SugaredLogger
	passwordManager auth.PasswordManager
	emailer         emailer.Service
}

func New(logger *zap.SugaredLogger, passwordManager auth.PasswordManager, dao AccountsDao, emailer emailer.Service) Service {
	return &accountsService{
		dao:             dao,
		logger:          logger,
		passwordManager: passwordManager,
		emailer:         emailer,
	}
}

func (a *accountsService) Authenticate(email, password string) (credentials *UserCredentials, err error) {
	creds, err := a.dao.GetUserCreds(email)
	if err != nil {
		a.logger.Errorf("Failed to look up user id for %s: %+v", email, err)
		return nil, err
	}
	if creds == nil {
		a.logger.Infof("Failed to load creds for user with email %s", email)
		return nil, nil
	}

	valid, err := a.passwordManager.Validate(password, creds.HashedPassword)
	if err != nil {
		a.logger.Errorf("Password validation failed for user with email %s", email)
		return nil, err
	}
	if !valid {
		a.logger.Infof("Wrong password for user with email %s", email)
		return nil, nil
	}
	a.logger.Infof("Returning creds %+v", creds)

	return creds, nil
}

func (a *accountsService) CreateAccount(
	email string,
	password string,
	firstName string,
	lastName string,
	enrollmentStatus *enrollment.Type,
) (approvalRequestId int64, status RegistrationStatus, err error) {
	hashed, err := a.passwordManager.HashAndSalt(password)
	if err != nil {
		a.logger.Errorf("Failed to hash password: %+v", err)
		return 0, RegistrationErr, err
	}

	return a.dao.CreateAccountRegistration(email, hashed, firstName, lastName, enrollmentStatus)
}

func (a *accountsService) UpdateAccount(
	userId int64,
	firstName string,
	lastName string,
	enrollmentStatus *enrollment.Type,
	bio,
	currentRole,
	currentSchool,
	currentCompany string,
) (approvalRequestId int64, status UpdateStatus, err error) {
	alreadyHasPendingUpdate, err := a.dao.DoesUserHavePendingAccountUpdate(userId)
	if err != nil {
		a.logger.Errorf("Failed to check for pending account update for account %d: %+v", userId, err)
		return 0, UpdateErr, err
	} else if alreadyHasPendingUpdate {
		a.logger.Warnf("User %d has issued multiple account updates", userId)
	}

	account, err := a.dao.GetAccount(userId)
	if err != nil {
		a.logger.Errorf("Failed to lookup account details: %+v", err)
		return 0, UpdateErr, err
	}

	approvalRequestId, err = a.dao.UpdateAccount(
		account,
		firstName,
		lastName,
		enrollmentStatus,
		bio,
		currentRole,
		currentSchool,
		currentCompany,
	)
	if err != nil {
		a.logger.Errorf("Failed to update account %d: %+v", userId, err)
		return 0, UpdateErr, err
	}

	return approvalRequestId, UpdateOk, nil
}

func (a *accountsService) GetAccountFullDetails(userId int64) (*Account, error) {
	account, err := a.dao.GetAccount(userId)
	if err != nil {
		a.logger.Errorf("Failed to look up account %d: %+v", userId, err)
		return nil, err
	}
	return account, err
}

func (a *accountsService) GetAccountRedacted(userId int64) (*RedactedAccount, error) {
	fullAccount, err := a.GetAccountFullDetails(userId)
	if err != nil {
		a.logger.Errorf("Failed to look up account %d: %+v", userId, err)
		return nil, err
	}

	return &RedactedAccount{
		FirstName:      fullAccount.FirstName,
		LastInitial:    string(fullAccount.LastName[0]),
		EnrollmentType: fullAccount.EnrollmentType,
		Bio:            fullAccount.Bio,
		CurrentRole:    fullAccount.CurrentRole,
		CurrentSchool:  fullAccount.CurrentSchool,
		CurrentCompany: fullAccount.CurrentCompany,
	}, nil
}

func (a *accountsService) HasUserSignedInBefore(userId int64) (bool, error) {
	answer, err := a.dao.HasUserSignedInBefore(userId)
	if err != nil {
		a.logger.Errorf("%+v", err)
	}
	return answer, err
}

func (a *accountsService) ResetPassword(token string, newPassword string) (status PasswordResetStatus, err error) {
	err = a.dao.RunInTransaction(func(transaction dao.Transaction) error {
		userIdForToken, tokenIsValid, err := a.dao.IsTokenValid(transaction, token)
		if err != nil {
			a.logger.Errorf("%+v", err)
			return err
		}

		a.logger.Infof("User %d is initiating a password reset flow", userIdForToken)

		if !tokenIsValid {
			a.logger.Infof("User %d used expired token", userIdForToken)
			status = BadToken
			return nil
		}

		hashedNewPassword, err := a.passwordManager.HashAndSalt(newPassword)
		if err != nil {
			return err
		}

		err = a.dao.SetAccountPassword(transaction, userIdForToken, hashedNewPassword)
		if err != nil {
			a.logger.Errorf("%+v", err)
			return err
		}

		err = a.dao.InvalidateToken(transaction, token)
		if err != nil {
			a.logger.Errorf("%+v", err)
			return err
		}

		status = ResetOk
		return nil
	})

	return status, err
}

func (a *accountsService) CreatePasswordResetToken(email string) {
	a.logger.Infof("User %s is initiating a password reset flow", email)
	token, err := a.dao.CreatePasswordResetToken(email)
	if err != nil {
		a.logger.Errorf("%+v", err)
	}

	a.emailer.PasswordResetToken(email, token)
}
