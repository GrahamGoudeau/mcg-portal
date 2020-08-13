package endpoints

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/resources"
)

type GetMyResourcesResponse struct {
	Resources []*resources.Resource `json:"resources"`
}

type accountsResource struct {
	service          accounts.Service
	resourcesService resources.Service
}

func buildAccountsResource(service accounts.Service, resourcesService resources.Service) restResource {
	return &accountsResource{
		service:          service,
		resourcesService: resourcesService,
	}
}

func (a *accountsResource) getAdminRestrictedRoutes() []string {
	return nil
}

func (a *accountsResource) setV1HandlerFuncs(ctx context.Context, logger *zap.SugaredLogger, authedEndpointsGroup *gin.RouterGroup) {
	accountsGroup := authedEndpointsGroup.Group("/accounts")

	accountsGroup.GET("/:id", func(c *gin.Context) {
		userId, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			statusWithMessage(c, http.StatusBadRequest, "bad id")
			return
		}

		redactedAccount, err := a.service.GetAccountRedacted(userId)
		if err != nil {
			panic(err)
		}
		c.JSON(http.StatusOK, redactedAccount)
	})
}
