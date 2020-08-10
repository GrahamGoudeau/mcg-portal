package rest

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
)

const (
	apiV1EndpointRoot = "/api/v1"
	secureEndpointRoot = "/secure"
)

type ServerConfig struct {
	JwtSecretKey string
	AllowHttp bool
	Port int

	AccountsService accounts.Service
}

type restResource interface {
	getAdminRestrictedRoutes() []string
	setV1HandlerFuncs(context.Context, *zap.SugaredLogger, *gin.RouterGroup)
}

func (s ServerConfig) StartServer(ctx context.Context, logger *zap.SugaredLogger) {
	server := gin.Default()

	authedRestResources := []restResource{
		buildJobsResource(),
		buildAccountsResource(s.AccountsService),
	}
	var adminRestrictedRoutes []string

	v1EndpointGroup := server.Group(apiV1EndpointRoot)
	authedV1Endpoints := v1EndpointGroup.Group(secureEndpointRoot)
	buildRegistrationsService(s.AccountsService).setV1HandlerFuncs(ctx, logger, v1EndpointGroup)

	for _, resource := range authedRestResources {
		adminRestrictedRoutes = append(adminRestrictedRoutes, resource.getAdminRestrictedRoutes()...)
	}

	authMiddleware := GetAuthMiddleware(logger, s.JwtSecretKey, adminRestrictedRoutes, s.AccountsService)
	v1EndpointGroup.POST("/login", authMiddleware.LoginHandler)
	authedV1Endpoints.Use(authMiddleware.MiddlewareFunc())

	for _, resource := range authedRestResources {
		resource.setV1HandlerFuncs(ctx, logger, authedV1Endpoints)
	}

	server.Use(static.ServeRoot("/static/js", "/app/ui/static/js"))
	server.Use(static.ServeRoot("/img", "/app/ui/public"))
	server.Use(static.ServeRoot("/static/css", "/app/ui/static/css"))
	server.Use(static.ServeRoot("/static/media", "/app/ui/static/media"))

	server.NoRoute(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, apiV1EndpointRoot) || strings.HasPrefix(c.Request.URL.Path, "/api") {
			statusWithMessage(c, http.StatusNotFound, "unknown api route")
			return
		}
		c.File("/app/ui/index.html")
	})

	if err := http.ListenAndServe(fmt.Sprintf(":%d", s.Port), server); err != nil {
		logger.Fatalf("%+v", err)
	}
}
