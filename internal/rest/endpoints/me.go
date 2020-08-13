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

func buildMeResource(logger *zap.SugaredLogger, accountsService accounts.Service, resourcesService resources.Service) restResource {
	return &meResource{
		logger:           logger,
		accountsService:  accountsService,
		resourcesService: resourcesService,
	}
}

type meResource struct {
	logger           *zap.SugaredLogger
	accountsService  accounts.Service
	resourcesService resources.Service
}

func (m *meResource) getAdminRestrictedRoutes() []string {
	return nil
}

func (m *meResource) setV1HandlerFuncs(ctx context.Context, logger *zap.SugaredLogger, authedEndpointsGroup *gin.RouterGroup) {
	meGroup := authedEndpointsGroup.Group("/me")

	meGroup.GET("/", func(c *gin.Context) {
		creds := getUserCredentialsFromContext(c)
		account, err := m.accountsService.GetAccountFullDetails(creds.Id)
		if err != nil {
			panic(err)
		}

		c.JSON(http.StatusOK, account)
	})

	meGroup.PUT("/", func(c *gin.Context) {
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
		approvalRequestId, updateStatus, err := m.accountsService.UpdateAccount(
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

	meGroup.GET("/resources/", func(c *gin.Context) {
		creds := getUserCredentialsFromContext(c)
		resourcesResult, err := m.resourcesService.GetResourcesForUser(creds.Id)
		if err != nil {
			panic(err)
		}

		c.JSON(http.StatusOK, &GetMyResourcesResponse{
			Resources: resourcesResult,
		})
	})

	meGroup.DELETE("/resources/:id", func(c *gin.Context) {
		creds := getUserCredentialsFromContext(c)
		resourceId, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			statusWithMessage(c, http.StatusBadRequest, "bad id")
			return
		}
		err = m.resourcesService.DeleteResourceFromUser(creds.Id, resourceId)
		if err != nil {
			panic(err)
		}
		statusWithMessage(c, http.StatusOK, "ok")
	})
}
