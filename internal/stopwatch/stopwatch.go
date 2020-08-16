package stopwatch

import (
	"time"

	"go.uber.org/zap"
)

type Stopwatch interface {
	LogMessage(message string)
}

func New(logger *zap.SugaredLogger) Stopwatch {
	return &stopwatch{
		startTime: time.Now(),
		logger:    logger,
	}
}

type stopwatch struct {
	startTime   time.Time
	lastLogTime time.Time
	logger      *zap.SugaredLogger
}

func (s *stopwatch) LogMessage(message string) {
	now := time.Now()
	if s.lastLogTime.IsZero() {
		s.lastLogTime = now
	}
	timeFromStart := now.Sub(s.startTime)
	timeFromLastLog := now.Sub(s.lastLogTime)

	s.logger.Infof(message+": %dms since last, %dms total", timeFromLastLog.Milliseconds(), timeFromStart.Milliseconds())
}
