package endpoints

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/jobs"
)

type AllJobsResponse struct {
	Jobs []*jobs.Job `json:"jobs"`
}

type JobCreationRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	Location    string `json:"location" binding:"required"`
}

type JobCreationResponse struct {
	ApprovalRequestId int64 `json:"approvalRequestId"`
}

type jobsResource struct {
	service jobs.Service
}

func buildJobsResource(service jobs.Service) restResource {
	return &jobsResource{
		service: service,
	}
}

func (j *jobsResource) getAdminRestrictedRoutes() []string {
	return nil
}

func (j *jobsResource) setV1HandlerFuncs(ctxx context.Context, logger *zap.SugaredLogger, authedEndpointsGroup *gin.RouterGroup) {
	jobsGroup := authedEndpointsGroup.Group("/jobs")

	jobsGroup.GET("/", func(context *gin.Context) {
		allJobs, err := j.service.GetAllJobs()
		if err != nil {
			panic(err)
		}

		context.JSON(http.StatusOK, &AllJobsResponse{
			Jobs: allJobs,
		})
	})

	jobsGroup.POST("/", func(c *gin.Context) {
		creds := getUserCredentialsFromContext(c)
		req := JobCreationRequest{}
		err := c.BindJSON(&req)
		if err != nil {
			statusWithMessage(c, http.StatusBadRequest, "bad request")
			return
		}

		approvalRequestId, err := j.service.CreateJob(creds.Id, req.Title, req.Description, req.Location)
		if err != nil {
			panic(err)
		}

		c.JSON(http.StatusCreated, &JobCreationResponse{
			ApprovalRequestId: approvalRequestId,
		})
	})
}
