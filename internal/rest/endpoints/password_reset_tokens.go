package endpoints

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
)

func buildPasswordResetResource(accountsService accounts.Service) restResource {
	return &passwordResetResource{
		accountsService: accountsService,
	}
}

type passwordResetResource struct {
	accountsService accounts.Service
}

type PasswordResetInitiationRequest struct {
	Email string `json:"email" binding:"required"`
}

type PasswordResetRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required"`
}

type PasswordResetResponse struct {
	Result accounts.PasswordResetStatus `json:"result"`
}

func (p *passwordResetResource) getAdminRestrictedRoutes() []string {
	return nil
}

func (p *passwordResetResource) setV1HandlerFuncs(ctx context.Context, logger *zap.SugaredLogger, unAuthedGroup *gin.RouterGroup) {
	resetGroup := unAuthedGroup.Group("/password-reset")
	resetGroup.POST("/", func(c *gin.Context) {
		req := PasswordResetInitiationRequest{}
		err := c.BindJSON(&req)
		if err != nil {
			return
		}

		p.accountsService.CreatePasswordResetToken(req.Email)
		statusWithMessage(c, http.StatusOK, "ok")
	})

	resetGroup.POST("/tokens", func(c *gin.Context) {
		req := PasswordResetRequest{}
		err := c.BindJSON(&req)
		if err != nil {
			return
		}

		_, err = uuid.Parse(req.Token)
		if err != nil {
			statusWithMessage(c, http.StatusBadRequest, "bad uuid")
			return
		}

		status, err := p.accountsService.ResetPassword(req.Token, req.NewPassword)
		if err != nil {
			panic(err)
		}

		if status != accounts.ResetOk {
			c.JSON(http.StatusBadRequest, &PasswordResetResponse{
				Result: status,
			})
			return
		}

		c.JSON(http.StatusOK, &PasswordResetResponse{
			Result: status,
		})
	})
}
