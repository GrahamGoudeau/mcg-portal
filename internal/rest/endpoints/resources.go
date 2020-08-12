package endpoints

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/resources"
)

type GetResourcesResponse struct {
	Users []*resources.UserOfferingResources `json:"users"`
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

		context.JSON(http.StatusOK, &GetResourcesResponse{
			Users: result,
		})
	})
}
