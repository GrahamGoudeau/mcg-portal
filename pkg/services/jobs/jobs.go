package jobs

import (
	"time"

	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/dao"
	"portal.mcgyouthandarts.org/pkg/services/accounts/enrollment"
)

type JobDetails struct {
	JobId       int64     `json:"jobId"`
	Title       string    `json:"title"`
	PostedAt    time.Time `json:"postedAt"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
}

type JobPoster struct {
	PosterId        int64            `json:"posterId"`
	PosterFirstName string           `json:"posterFirstName"`
	PosterLastName  string           `json:"posterLastInitial"`
	EnrollmentType  *enrollment.Type `json:"enrollmentType,omitempty"`
}

type Job struct {
	Details *JobDetails `json:"details"`
	Poster  *JobPoster  `json:"poster"`
}

type Service interface {
	GetAllJobs() ([]*Job, error)
	GetJobById(jobId int64) (*Job, error)
	CreateJob(posterId int64, title, description, location string) (approvalRequestId int64, err error)
}

type Dao interface {
	GetAllJobs() ([]*Job, error)
	GetJobById(jobId int64) (*Job, error)

	RunInTransaction(block func(transaction dao.Transaction) error) error
	CreateJob(transaction dao.Transaction, posterId int64, title, description, location string) (approvalRequestId int64, err error)
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

func (s *service) GetAllJobs() ([]*Job, error) {
	return s.dao.GetAllJobs()
}

func (s *service) GetJobById(jobId int64) (*Job, error) {
	return s.dao.GetJobById(jobId)
}

func (s *service) CreateJob(posterId int64, title, description, location string) (approvalRequestId int64, err error) {
	err = s.dao.RunInTransaction(func(transaction dao.Transaction) error {
		approvalRequestId, err = s.dao.CreateJob(transaction, posterId, title, description, location)
		return err
	})
	if err != nil {
		s.logger.Errorf("%+v", err)
	}
	return approvalRequestId, err
}
