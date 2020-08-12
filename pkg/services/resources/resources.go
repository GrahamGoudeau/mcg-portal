package resources

import (
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/accounts/enrollment"
)

type Resource struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

type UserOfferingResources struct {
	UserId         int64            `json:"userId"`
	FirstName      string           `json:"firstName"`
	LastInitial    string           `json:"lastInitial"`
	Resources      []*Resource      `json:"resources"`
	EnrollmentType *enrollment.Type `json:"enrollmentType"`
}

type Service interface {
	GetResourcesForUser(userId int64) ([]*Resource, error)
	DeleteResourceFromUser(userId, resourceId int64) error
	GetUsersOfferingResources() ([]*UserOfferingResources, error)
}

type Dao interface {
	GetResourcesForUser(userId int64) ([]*Resource, error)
	DeleteResourceFromUser(userId, resourceId int64) error
	GetUsersOfferingResources() ([]*UserOfferingResources, error)
}

type service struct {
	logger *zap.SugaredLogger
	dao    Dao
}

func New(logger *zap.SugaredLogger, dao Dao) Service {
	return &service{
		logger: logger,
		dao:    dao,
	}
}

func (s *service) GetResourcesForUser(userId int64) ([]*Resource, error) {
	result, err := s.dao.GetResourcesForUser(userId)
	if err != nil {
		s.logger.Errorf("%+v", err)
	}
	return result, err
}

func (s *service) DeleteResourceFromUser(userId, resourceId int64) error {
	err := s.dao.DeleteResourceFromUser(userId, resourceId)
	if err != nil {
		s.logger.Errorf("%+v", err)
	}
	return err
}

func (s *service) GetUsersOfferingResources() ([]*UserOfferingResources, error) {
	result, err := s.dao.GetUsersOfferingResources()
	if err != nil {
		s.logger.Errorf("%+v", err)
	}
	return result, err
}
