package rest

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/accounts/enrollment"
)

type accountsResource struct {
	service accounts.Service
}

func buildAccountsResource(service accounts.Service) restResource {
	return &accountsResource{
		service: service,
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

	accountsGroup.PUT("/me", func(c *gin.Context) {
		type updateReq struct {
			FirstName string `json:"firstName" binding:"required"`
			LastName string `json:"lastName" binding:"required"`
			EnrollmentStatus *enrollment.Type `json:"enrollmentStatus"`
			Bio string `json:"bio"`
			CurrentRole string `json:"currentRole"`
			CurrentSchool string `json:"currentSchool"`
			CurrentCompany string `json:"currentCompany"`
		}
		req := updateReq{}
		err := c.BindJSON(&req)
		if err != nil {
			return
		}
		creds := getUserCredentialsFromContext(c)
		updateStatus, err := a.service.UpdateAccount(
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
		statusWithMessage(c, http.StatusOK, "ok")
	})

	accountsGroup.GET("/me/jobs/", func(c *gin.Context) {
		sentUnauthorized := validateUserOwnsResource(c, "selector")
		if sentUnauthorized {
			return
		}
		c.Writer.WriteHeader(200)
		c.Writer.Write([]byte("my jobs ok"))
	})
}
