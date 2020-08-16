package approvals

import (
	"time"

	"github.com/pkg/errors"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/dao"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/emailer"
)

type ApprovalRequestType string

const (
	Account    ApprovalRequestType = "account"
	Connection ApprovalRequestType = "connection"
	Job        ApprovalRequestType = "job"
	Event      ApprovalRequestType = "event"
)

type ApprovalResponse string

const (
	NotReviewed   ApprovalResponse = "Not Reviewed"
	Approved      ApprovalResponse = "Approved"
	Rejected      ApprovalResponse = "Rejected"
	NotApplicable ApprovalResponse = "Not Applicable"
)

type Service interface {
	GetAllRequests() ([]*ApprovalRequest, error)
	RespondToRequest(respondingAdmin int64, requestId int64, response ApprovalResponse) error
}

type Dao interface {
	RunInTransaction(block func(transaction dao.Transaction) error) error
	GetAllRequests() ([]*ApprovalRequest, error)
	SetStatusOnRequest(tx dao.Transaction, respondingAdmin int64, requestId int64, response ApprovalResponse) error
	GetRequestMetadata(tx dao.Transaction, requestId int64) (*ApprovalRequestMetadata, error)
	ApproveConnection(tx dao.Transaction, metadata *ApprovalRequestMetadata) (connectionId int64, err error)
	ApproveAccountChange(tx dao.Transaction, metadata *ApprovalRequestMetadata) (accountId int64, userName string, userEmail string, err error)
	ApproveJobChange(tx dao.Transaction, metadata *ApprovalRequestMetadata) (jobId int64, err error)
	ApproveEventChange(tx dao.Transaction, metadata *ApprovalRequestMetadata) (eventId int64, err error)
}

type AccountRequest struct {
	*accounts.Account
	IsNewAccount bool `json:"isNewAccount"`
}

type Name struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

type ConnectionRequest struct {
	RequesteeName  Name   `json:"requesteeName"`
	RequesteeEmail string `json:"requesteeEmail"`
	RequesterName  Name   `json:"requesterName"`
	RequesterEmail string `json:"requesterEmail"`
}

type EventRequest struct {
	Name           string    `json:"name"`
	OrganizerName  Name      `json:"organizerName"`
	OrganizerEmail string    `json:"organizerEmail"`
	Time           time.Time `json:"time"`
	Description    string    `json:"description"`
	IsNewEvent     bool      `json:"isNewEvent"`
}

type JobRequest struct {
	IsNewJob    bool      `json:"isNewJob"`
	Title       string    `json:"title"`
	PostedAt    time.Time `json:"postedAt"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	Poster      string    `json:"poster"`
}

type ApprovalRequest struct {
	Metadata   *ApprovalRequestMetadata `json:"metadata"`
	Account    *AccountRequest          `json:"account,omitempty"`
	Connection *ConnectionRequest       `json:"connection,omitempty"`
	Event      *EventRequest            `json:"event,omitempty"`
	Job        *JobRequest              `json:"job,omitempty"`
}

type ApprovalRequestMetadata struct {
	Id   int64               `json:"id"`
	Type ApprovalRequestType `json:"type"`
}

type service struct {
	dao     Dao
	logger  *zap.SugaredLogger
	emailer emailer.Service
}

func New(logger *zap.SugaredLogger, emailer emailer.Service, dao Dao) Service {
	return &service{
		dao:     dao,
		logger:  logger,
		emailer: emailer,
	}
}

func (s *service) RespondToRequest(respondingAdmin int64, requestId int64, response ApprovalResponse) error {
	return s.dao.RunInTransaction(func(transaction dao.Transaction) error {
		s.logger.Infof("Admin %d is responding %s to request %d", respondingAdmin, string(response), requestId)

		err := s.dao.SetStatusOnRequest(transaction, respondingAdmin, requestId, response)
		if err != nil {
			s.logger.Errorf("Admin %d failed to respond %s to request %d: %+v", respondingAdmin, string(response), requestId, err)
			return err
		}
		if response != Approved {
			s.logger.Infof("Admin %d is marking request %d as not applicable", respondingAdmin, requestId)
			return nil
		}
		requestMetadata, err := s.dao.GetRequestMetadata(transaction, requestId)
		if err != nil {
			s.logger.Errorf("Admin %d failed to look up metadata for request %d: %+v", respondingAdmin, requestId, err)
			return err
		}
		s.logger.Infof("Got metadata %+v", requestMetadata)
		switch requestMetadata.Type {
		case Account:
			_, userName, userEmail, err := s.dao.ApproveAccountChange(transaction, requestMetadata)
			if err == nil {
				s.emailer.AccountConfirmed(userEmail, userName)
			} else {
				s.logger.Errorf("%+v", err)
			}
			return err
		case Connection:
			_, err = s.dao.ApproveConnection(transaction, requestMetadata)
			if err != nil {
				s.logger.Errorf("%+v", err)
			}
			return err
		case Job:
			_, err = s.dao.ApproveJobChange(transaction, requestMetadata)
			if err != nil {
				s.logger.Errorf("%+v", err)
			}
			return err
		case Event:
			_, err = s.dao.ApproveEventChange(transaction, requestMetadata)
			if err != nil {
				s.logger.Errorf("%+v", err)
			}
			return err
		default:
			return errors.Errorf("unhandled request type %s", requestMetadata.Type)
		}
	})
}

func (s *service) GetAllRequests() ([]*ApprovalRequest, error) {
	s.logger.Infof("Getting all approval requests")
	result, err := s.dao.GetAllRequests()
	if err != nil {
		s.logger.Errorf("%+v", err)
		return nil, err
	}
	return result, nil
}
