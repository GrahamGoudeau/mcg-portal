package events

import (
	"time"

	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/dao"
)

type Event struct {
	Id                 int64     `json:"id"`
	Name               string    `json:"name"`
	OrganizerId        int64     `json:"organizerId"`
	OrganizerFirstName string    `json:"organizerFirstName"`
	OrganizerLastName  string    `json:"organizerLastName"`
	Description        string    `json:"description"`
	Time               time.Time `json:"time"`
}

type Service interface {
	GetAllEvents() ([]*Event, error)
	CreateEvent(organizerId int64, description string, eventName string, eventTime time.Time) (approvalRequestId int64, err error)
}

type Dao interface {
	GetAllEvents() ([]*Event, error)
	RunInTransaction(block func(transaction dao.Transaction) error) error
	CreateEvent(transaction dao.Transaction, organizerId int64, description string, eventName string, eventTime time.Time) (approvalRequestId int64, err error)
}

func New(logger *zap.SugaredLogger, dao Dao) Service {
	return &service{
		logger: logger,
		dao:    dao,
	}
}

type service struct {
	logger *zap.SugaredLogger
	dao    Dao
}

func (s *service) GetAllEvents() ([]*Event, error) {
	result, err := s.dao.GetAllEvents()
	if err != nil {
		s.logger.Errorf("%+v", err)
		return nil, err
	}
	return result, nil
}

func (s *service) CreateEvent(organizerId int64, description string, eventName string, eventTime time.Time) (approvalRequestId int64, err error) {
	err = s.dao.RunInTransaction(func(transaction dao.Transaction) error {
		approvalRequestId, err = s.dao.CreateEvent(transaction, organizerId, description, eventName, eventTime)
		return err
	})
	if err != nil {
		s.logger.Errorf("%+v", err)
	}
	return approvalRequestId, err
}
