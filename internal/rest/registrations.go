package rest

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/accounts/enrollment"
)

type registrationsService struct {
	service accounts.Service
}
func buildRegistrationsService(service accounts.Service) restResource {
	return &registrationsService{
		service: service,
	}
}

func (j *registrationsService) getAdminRestrictedRoutes() []string {
	return nil
}

func (j *registrationsService) setV1HandlerFuncs(ctx context.Context, logger *zap.SugaredLogger, unAuthedRouteGroup *gin.RouterGroup) {
	jobsGroup := unAuthedRouteGroup.Group("/registrations")

	jobsGroup.POST("/", func(context *gin.Context) {
		start := time.Now()
		logger.Info("Starting registration")
		type accountRequest struct {
			Email string `json:"email" binding:"required"`
			Password string `json:"password" binding:"required"`
			FirstName string `json:"firstName" binding:"required"`
			LastName string `json:"lastName" binding:"required"`
			EnrollmentStatus *string `json:"enrollmentStatus"`
		}
		req := accountRequest{}
		err := context.BindJSON(&req)
		if err != nil {
			return
		}

		var enrollmentStatus *enrollment.Type = nil
		if req.EnrollmentStatus != nil {
			converted, err := enrollment.ConvertToEnrollment(*req.EnrollmentStatus)
			if err != nil {
				statusWithMessage(context, http.StatusBadRequest, "invalid enrollment status")
				return
			}
			enrollmentStatus = &converted
		}

		logger.Infof("Parsed JSON: %dms", (time.Since(start)).Milliseconds())

		status, err := j.service.CreateAccount(req.Email, req.Password, req.FirstName, req.LastName, enrollmentStatus)
		if err != nil {
			panic(err)
		} else if status != accounts.RegistrationOk {
			logger.Infof("Failed account registration for reason %s", status)
			type validationError struct {
				Message string `json:"message"`
			}
			context.JSON(http.StatusBadRequest, &validationError{
				Message: string(status),
			})
			return
		}

		statusWithMessage(context, http.StatusOK, "ok")

		logger.Infof("created account: %dms", (time.Since(start)).Milliseconds())
	})
}
