package approvals

import (
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/dao"
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
	RespondToRequest(respondingAdmin int64, requestId int64, response ApprovalResponse) error
}

type Dao interface {
	RunInTransaction(block func(transaction dao.Transaction) error) error
	SetStatusOnRequest(tx dao.Transaction, respondingAdmin int64, requestId int64, response ApprovalResponse) error
	GetRequestMetadata(tx dao.Transaction, requestId int64) (*ApprovalRequestMetadata, error)
	ApproveConnection(tx dao.Transaction, metadata *ApprovalRequestMetadata) (connectionId int64, err error)
	ApproveAccountChange(tx dao.Transaction, metadata *ApprovalRequestMetadata) (accountId int64, err error)
	ApproveJobChange(tx dao.Transaction, metadata *ApprovalRequestMetadata) (jobId int64, err error)
	ApproveEventChange(tx dao.Transaction, metadata *ApprovalRequestMetadata) (eventId int64, err error)
}

type ApprovalRequestMetadata struct {
	Id   int64
	Type ApprovalRequestType
}

type service struct {
	dao    Dao
	logger *zap.SugaredLogger
}

func New(logger *zap.SugaredLogger, dao Dao) Service {
	return &service{
		dao:    dao,
		logger: logger,
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
			_, err = s.dao.ApproveAccountChange(transaction, requestMetadata)
			return err
		case Connection:
			fallthrough
		case Job:
			fallthrough
		case Event:
			fallthrough
		default:
			return errors.Errorf("unhandled request type %s", requestMetadata.Type)
		}
	})
}
