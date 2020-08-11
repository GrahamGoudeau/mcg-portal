package endpoints

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/approvals"
)

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

	approvalRequestsGroup.PUT("/:id/", func(context *gin.Context) {
		creds := getUserCredentialsFromContext(context)
		if !creds.IsAdmin {
			statusWithMessage(context, http.StatusUnauthorized, "not admin")
			return
		}
		requestId, err := strconv.ParseInt(context.Param("id"), 10, 64)
		if err != nil {
			statusWithMessage(context, http.StatusBadRequest, "bad id")
			return
		}

		logger.Infof("%d is authorized", creds.Id)
		type responseRequest struct {
			Response approvals.ApprovalResponse `json:"response" binding:"required"`
		}
		req := responseRequest{}
		err = context.BindJSON(&req)
		if err != nil {
			return
		}

		err = a.approvalsService.RespondToRequest(creds.Id, requestId, req.Response)
		if err != nil {
			logger.Errorf("%+v", err)
			statusWithMessage(context, http.StatusInternalServerError, "error")
			return
		}
		statusWithMessage(context, http.StatusOK, "ok")
	})
}
