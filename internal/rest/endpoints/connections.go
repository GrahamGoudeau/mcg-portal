package endpoints

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/connections"
)

func buildConnectionsResource(logger *zap.SugaredLogger, service connections.Service) restResource {
	return &connectionsResource{
		logger:  logger,
		service: service,
	}
}

type InitiateConnectionsRequest struct {
	RequesteeId int64 `json:"requesteeId"`
}

type connectionsResource struct {
	logger  *zap.SugaredLogger
	service connections.Service
}

func (c *connectionsResource) getAdminRestrictedRoutes() []string {
	return nil
}

func (c *connectionsResource) setV1HandlerFuncs(_ context.Context, _ *zap.SugaredLogger, authedRouteGroup *gin.RouterGroup) {
	connectionsGroup := authedRouteGroup.Group("/connections")

	connectionsGroup.POST("/", func(context *gin.Context) {
		req := InitiateConnectionsRequest{}
		err := context.BindJSON(&req)
		if err != nil {
			return
		}

		creds := getUserCredentialsFromContext(context)

		err = c.service.RequestConnection(creds.Id, req.RequesteeId)
		if err != nil {
			statusWithMessage(context, http.StatusInternalServerError, "error")
			return
		}

		statusWithMessage(context, http.StatusOK, "ok")
	})
}
