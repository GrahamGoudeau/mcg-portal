package endpoints

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/events"
)

type AllEventsResponse struct {
	Events []*events.Event `json:"events"`
}

type CreateEventRequest struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	Time        time.Time `json:"time"`
}

type CreateEventResponse struct {
	ApprovalRequestId int64 `json:"approvalRequestId"`
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

		if allEvents == nil {
			allEvents = []*events.Event{}
		}
		c.JSON(http.StatusOK, &AllEventsResponse{
			Events: allEvents,
		})
	})

	eventsGroup.POST("/", func(c *gin.Context) {
		creds := getUserCredentialsFromContext(c)
		req := CreateEventRequest{}
		err := c.BindJSON(&req)
		if err != nil {
			statusWithMessage(c, http.StatusBadRequest, "bad request")
			return
		}

		approvalRequestId, err := e.eventsService.CreateEvent(
			creds.Id,
			req.Description,
			req.Name,
			req.Date,
			req.Time,
		)
		if err != nil {
			panic(err)
		}
		c.JSON(http.StatusOK, &CreateEventResponse{
			ApprovalRequestId: approvalRequestId,
		})
	})
}
