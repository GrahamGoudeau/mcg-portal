package rest

import (
	"context"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type adminApprovalsResource struct {

}

func buildApprovalsRequestResource() restResource {
	return &adminApprovalsResource{

	}
}

func (a *adminApprovalsResource) getAdminRestrictedRoutes() []string {
	return nil
}

func (a *adminApprovalsResource) setV1HandlerFuncs(ctx context.Context, logger *zap.SugaredLogger, authedEndpointsGroup *gin.RouterGroup) {
	approvalRequestsGroup := authedEndpointsGroup.Group("/approval-requests")

	approvalRequestsGroup.GET("/", func(context *gin.Context) {
		context.Writer.WriteHeader(200)
		context.Writer.Write([]byte("ok"))
	})
}
