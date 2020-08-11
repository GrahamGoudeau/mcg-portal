package endpoints

import (
	"context"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type jobsResource struct {
}

func buildJobsResource() restResource {
	return &jobsResource{}
}

func (j *jobsResource) getAdminRestrictedRoutes() []string {
	return nil
}

func (j *jobsResource) setV1HandlerFuncs(ctxx context.Context, logger *zap.SugaredLogger, authedEndpointsGroup *gin.RouterGroup) {
	jobsGroup := authedEndpointsGroup.Group("/jobs")

	jobsGroup.GET("/", func(context *gin.Context) {
		context.Writer.WriteHeader(200)
		context.Writer.Write([]byte("ok"))
	})
}
