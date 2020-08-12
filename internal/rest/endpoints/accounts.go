package endpoints

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/accounts/enrollment"
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

	accountsGroup.GET("/me", func(c *gin.Context) {
		creds := getUserCredentialsFromContext(c)
		account, err := a.service.GetAccount(creds.Id)
		if err != nil {
			panic(err)
		}

		c.JSON(http.StatusOK, account)
	})

	accountsGroup.GET("/me/resources", func(c *gin.Context) {
		creds := getUserCredentialsFromContext(c)
		resourcesResult, err := a.resourcesService.GetResourcesForUser(creds.Id)
		if err != nil {
			panic(err)
		}

		c.JSON(http.StatusOK, &GetMyResourcesResponse{
			Resources: resourcesResult,
		})
	})

	accountsGroup.DELETE("/me/resources/:id", func(c *gin.Context) {
		creds := getUserCredentialsFromContext(c)
		resourceId, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			statusWithMessage(c, http.StatusBadRequest, "bad id")
			return
		}
		err = a.resourcesService.DeleteResourceFromUser(creds.Id, resourceId)
		if err != nil {
			panic(err)
		}
		statusWithMessage(c, http.StatusOK, "ok")
	})

	accountsGroup.PUT("/me", func(c *gin.Context) {
		type updateReq struct {
			FirstName        string           `json:"firstName" binding:"required"`
			LastName         string           `json:"lastName" binding:"required"`
			EnrollmentStatus *enrollment.Type `json:"enrollmentStatus"`
			Bio              string           `json:"bio"`
			CurrentRole      string           `json:"currentRole"`
			CurrentSchool    string           `json:"currentSchool"`
			CurrentCompany   string           `json:"currentCompany"`
		}
		req := updateReq{}
		err := c.BindJSON(&req)
		if err != nil {
			return
		}
		creds := getUserCredentialsFromContext(c)
		approvalRequestId, updateStatus, err := a.service.UpdateAccount(
			creds.Id,
			req.FirstName,
			req.LastName,
			req.EnrollmentStatus,
			req.Bio,
			req.CurrentRole,
			req.CurrentSchool,
			req.CurrentCompany,
		)
		if err != nil {
			panic(err)
		}
		if updateStatus != accounts.UpdateOk {
			statusWithMessage(c, http.StatusBadRequest, string(updateStatus))
			return
		}
		resp := ApprovalSubmissionResponse{
			ApprovalRequestId: approvalRequestId,
		}
		c.JSON(http.StatusOK, &resp)
	})
}
