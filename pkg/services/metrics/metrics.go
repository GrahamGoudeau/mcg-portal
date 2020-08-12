package metrics

import (
	"fmt"
	"time"

	"github.com/patrickmn/go-cache"
	"go.uber.org/zap"
)

type Service interface {
	RecordLogIn(userId int64)
}

type Dao interface {
	RecordLogIn(userId int64) error
}

func New(logger *zap.SugaredLogger, dao Dao) Service {
	return &service{
		logger:     logger,
		dao:        dao,
		loginCache: cache.New(12*time.Hour, 30*time.Minute),
	}
}

type service struct {
	dao        Dao
	logger     *zap.SugaredLogger
	loginCache *cache.Cache
}

// this blocks; should be run async
func (s *service) RecordLogIn(userId int64) {
	_, _, dayOfMonth := time.Now().Date()
	key := fmt.Sprintf("%d%d", userId, dayOfMonth)
	if _, ok := s.loginCache.Get(key); ok {
		s.logger.Infof("User login cache hit for %d", userId)
		return
	} else {
		s.logger.Infof("User login cache miss for %d", userId)
	}

	err := s.dao.RecordLogIn(userId)
	if err != nil {
		s.logger.Errorf("Failed to record login for user %d: %+v", userId, err)
		return
	}

	s.loginCache.Set(key, struct{}{}, cache.DefaultExpiration)
}
