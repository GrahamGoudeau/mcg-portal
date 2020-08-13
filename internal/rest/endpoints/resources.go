package endpoints

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/resources"
)

type GetResourcesResponse struct {
	Users []*resources.UserOfferingResources `json:"users"`
}

type MutateResourceRequest struct {
	Name string `json:"name"`
}

func buildResourcesResource(logger *zap.SugaredLogger, resourcesService resources.Service) restResource {
	return &resourcesResource{
		logger:           logger,
		resourcesService: resourcesService,
	}
}

type resourcesResource struct {
	logger           *zap.SugaredLogger
	resourcesService resources.Service
}

func (r *resourcesResource) getAdminRestrictedRoutes() []string {
	return nil
}

func (r *resourcesResource) setV1HandlerFuncs(ctxx context.Context, logger *zap.SugaredLogger, authedEndpointsGroup *gin.RouterGroup) {
	resourcesGroup := authedEndpointsGroup.Group("/resources")

	resourcesGroup.GET("/", func(context *gin.Context) {
		result, err := r.resourcesService.GetUsersOfferingResources()
		if err != nil {
			panic(err)
		}

		if result == nil {
			result = []*resources.UserOfferingResources{}
		}
		context.JSON(http.StatusOK, &GetResourcesResponse{
			Users: result,
		})
	})

	resourcesGroup.POST("/", func(c *gin.Context) {
		creds := getUserCredentialsFromContext(c)
		req := MutateResourceRequest{}
		err := c.BindJSON(&req)
		if err != nil {
			return
		}

		err = r.resourcesService.CreateResourceForUser(creds.Id, req.Name)
		if err != nil {
			panic(err)
		}
		statusWithMessage(c, http.StatusOK, "ok")
	})

	resourcesGroup.DELETE("/:resourceId", func(c *gin.Context) {
		resourceId, err := strconv.ParseInt(c.Param("resourceId"), 10, 64)
		if err != nil {
			statusWithMessage(c, http.StatusBadRequest, "bad param")
			return
		}

		creds := getUserCredentialsFromContext(c)
		err = r.resourcesService.DeleteResourceFromUser(creds.Id, resourceId)
		if err != nil {
			panic(err)
		}
		statusWithMessage(c, http.StatusOK, "ok")
	})
}
