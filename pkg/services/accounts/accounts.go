package accounts

import (
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/accounts/auth"
	"portal.mcgyouthandarts.org/pkg/services/accounts/enrollment"
)

type Service interface {
	// returns non-nil credentials if authenticated
	Authenticate(email, password string) (credentials *UserCredentials, err error)

	CreateAccount(
		email string,
		password string,
		firstName string,
		lastName string,
		enrollmentStatus *enrollment.Type,
	) (RegistrationStatus, error)

	UpdateAccount(
		userId int64,
		firstName string,
		lastName string,
		enrollmentStatus *enrollment.Type,
		bio,
		currentRole,
		currentSchool,
		currentCompany string,
	) (UpdateStatus, error)

	GetAccount(userId int64) (*Account, error)
}

type Account struct {
	UserId int64 `json:"userId"`
	Email string `json:"email"`
	FirstName string `json:"firstName"`
	LastName string `json:"lastName"`
	EnrollmentType *enrollment.Type `json:"enrollmentType"`
	Bio *string `json:"bio"`
	CurrentRole *string `json:"currentRole"`
	CurrentSchool *string `json:"currentSchool"`
	CurrentCompany *string `json:"currentCompany"`
}

type AccountsDao interface {
	GetUserCreds(email string) (*UserCredentials, error)

	// returns a registration failure if the cause is known, error for fatal unknown error
	CreateAccountRegistration(email, hashedPassword, firstName, lastName string, enrollmentStatus *enrollment.Type) (RegistrationStatus, error)
	DoesUserHavePendingAccountUpdate(userId int64) (bool, error)
	CancelPendingAccountUpdate(userId int64) error

	UpdateAccount(
		userId int64,
		firstName string,
		lastName string,
		enrollmentStatus *enrollment.Type,
		bio,
		currentRole,
		currentSchool,
		currentCompany string,
	) error

	GetAccount(userId int64) (*Account, error)
}

type RegistrationStatus string
const (
	RegistrationOk  RegistrationStatus = "ok"
	DuplicateEmail  RegistrationStatus = "duplicate"
	RegistrationErr RegistrationStatus = "unknown"
)

type UpdateStatus string
const (
	UpdateOk                UpdateStatus = "ok"
	AlreadyHasPendingUpdate UpdateStatus = "already_pending"
	UpdateErr UpdateStatus = "unknown"
)

type UserCredentials struct {
	Id int64
	IsAdmin bool
	HashedPassword string
}

type accountsService struct {
	dao AccountsDao
	logger *zap.SugaredLogger
	passwordManager auth.PasswordManager
}

func New(logger *zap.SugaredLogger, passwordManager auth.PasswordManager, dao AccountsDao) Service {
	return &accountsService{
		dao: dao,
		logger: logger,
		passwordManager: passwordManager,
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

	return creds, nil
}

func (a *accountsService) CreateAccount(
	email string,
	password string,
	firstName string,
	lastName string,
	enrollmentStatus *enrollment.Type,
) (RegistrationStatus, error) {
	hashed, err := a.passwordManager.HashAndSalt(password)
	if err != nil {
		return RegistrationErr, err
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
) (UpdateStatus, error) {
	alreadyHasPendingUpdate, err := a.dao.DoesUserHavePendingAccountUpdate(userId)
	if err != nil {
		a.logger.Errorf("Failed to check for pending account update for account %d: %+v", userId, err)
		return UpdateErr, err
	} else if alreadyHasPendingUpdate {
		return AlreadyHasPendingUpdate, nil
	}

	err = a.dao.UpdateAccount(
		userId,
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
		return UpdateErr, err
	}

	return UpdateOk, nil
}

func (a *accountsService) GetAccount(userId int64) (*Account, error) {
	account, err := a.dao.GetAccount(userId)
	if err != nil {
		a.logger.Errorf("Failed to look up account %d: %+v", userId, err)
		return nil, err
	}
	return account, err
}

