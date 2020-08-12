package connections

import (
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/dao"
)

type Service interface {
	RequestConnection(requesterId, requesteeId int64) (approvalRequestId int64, err error)
}

type Dao interface {
	RunInTransaction(block func(transaction dao.Transaction) error) error
	SubmitConnectionRequest(transaction dao.Transaction, requesterId, requesteeId int64) (approvalRequestIdValue int64, err error)
}

func New(logger *zap.SugaredLogger, dao Dao) Service {
	return &connectionsService{
		dao:    dao,
		logger: logger,
	}
}

type connectionsService struct {
	dao    Dao
	logger *zap.SugaredLogger
}

func (c *connectionsService) RequestConnection(requesterId, requesteeId int64) (approvalRequestId int64, err error) {
	c.logger.Infof("User %d is requesting a connectino with user %d", requesterId, requesteeId)
	err = c.dao.RunInTransaction(func(transaction dao.Transaction) error {
		approvalRequestId, err = c.dao.SubmitConnectionRequest(transaction, requesterId, requesteeId)
		if err != nil {
			c.logger.Errorf("%+v", err)
			return err
		}
		return err
	})
	if err != nil {
		c.logger.Errorf("%+v", err)
	}
	return approvalRequestId, err
}
