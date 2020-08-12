package endpoints

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/events"
)

type AllEventsResponse struct {
	Events []*events.Event
}

func buildEventsResource(logger *zap.SugaredLogger, service events.Service) restResource {
	return &eventsResource{
		eventsService: service,
		logger:        logger,
	}
}

type eventsResource struct {
	eventsService events.Service
	logger        *zap.SugaredLogger
}

func (*eventsResource) getAdminRestrictedRoutes() []string {
	return nil
}

func (e *eventsResource) setV1HandlerFuncs(ctxx context.Context, logger *zap.SugaredLogger, authedEndpointsGroup *gin.RouterGroup) {
	eventsGroup := authedEndpointsGroup.Group("/events")

	eventsGroup.GET("/", func(c *gin.Context) {
		allEvents, err := e.eventsService.GetAllEvents()
		if err != nil {
			panic(err)
		}

		c.JSON(http.StatusOK, &AllEventsResponse{
			Events: allEvents,
		})
	})
}
