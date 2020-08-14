package endpoints

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/approvals"
)

type AllRequestsResponse struct {
	Requests []*approvals.ApprovalRequest `json:"requests"`
}

type adminApprovalsResource struct {
	approvalsService approvals.Service
}

func buildApprovalsRequestResource(approvalsService approvals.Service) restResource {
	return &adminApprovalsResource{
		approvalsService: approvalsService,
	}
}

func (a *adminApprovalsResource) getAdminRestrictedRoutes() []string {
	return nil
}

func (a *adminApprovalsResource) setV1HandlerFuncs(ctx context.Context, logger *zap.SugaredLogger, authedEndpointsGroup *gin.RouterGroup) {
	approvalRequestsGroup := authedEndpointsGroup.Group("/approval-requests")
	approvalRequestsGroup.Use(func(c *gin.Context) {
		creds := getUserCredentialsFromContext(c)
		if !creds.IsAdmin {
			statusWithMessage(c, http.StatusUnauthorized, "not admin")
			c.Abort()
			return
		}
		c.Set("userId", creds.Id)
		c.Next()
	})

	approvalRequestsGroup.GET("/", func(c *gin.Context) {
		allRequests, err := a.approvalsService.GetAllRequests()
		if err != nil {
			logger.Errorf("%+v")
			statusWithMessage(c, http.StatusInternalServerError, "error")
			return
		}

		if allRequests == nil {
			allRequests = []*approvals.ApprovalRequest{}
		}
		c.JSON(http.StatusOK, &AllRequestsResponse{
			Requests: allRequests,
		})
	})

	approvalRequestsGroup.PUT("/:id/", func(context *gin.Context) {
		userIdInterface, _ := context.Get("userId")
		userId := userIdInterface.(int64)
		requestId, err := strconv.ParseInt(context.Param("id"), 10, 64)
		if err != nil {
			statusWithMessage(context, http.StatusBadRequest, "bad id")
			return
		}

		logger.Infof("%d is authorized", userId)
		type responseRequest struct {
			Response approvals.ApprovalResponse `json:"response" binding:"required"`
		}
		req := responseRequest{}
		err = context.BindJSON(&req)
		if err != nil {
			return
		}

		err = a.approvalsService.RespondToRequest(userId, requestId, req.Response)
		if err != nil {
			logger.Errorf("%+v", err)
			statusWithMessage(context, http.StatusInternalServerError, "error")
			return
		}
		statusWithMessage(context, http.StatusOK, "ok")
	})
}
