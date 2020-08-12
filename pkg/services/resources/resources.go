package resources

import "go.uber.org/zap"

type Resource struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

type Service interface {
	GetResourcesForUser(userId int64) ([]*Resource, error)
	DeleteResourceFromUser(userId, resourceId int64) error
}

type Dao interface {
	GetResourcesForUser(userId int64) ([]*Resource, error)
	DeleteResourceFromUser(userId, resourceId int64) error
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
