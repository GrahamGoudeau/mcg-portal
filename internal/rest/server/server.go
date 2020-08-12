package server

import (
	"context"

	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/internal/rest/endpoints"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/accounts/auth"
	"portal.mcgyouthandarts.org/pkg/services/approvals"
	"portal.mcgyouthandarts.org/pkg/services/connections"
	"portal.mcgyouthandarts.org/pkg/services/events"
	"portal.mcgyouthandarts.org/pkg/services/jobs"
	"portal.mcgyouthandarts.org/pkg/services/resources"
)

func Start(
	logger *zap.SugaredLogger,
	port int,
	jwtKey string,
	accountsDao accounts.AccountsDao,
	approvalsDao approvals.Dao,
	connectionsDao connections.Dao,
	resourcesDao resources.Dao,
	eventsDao events.Dao,
	jobsDao jobs.Dao,
	allowHttp bool,
	passwordManager auth.PasswordManager,
) {
	serverConfig := endpoints.ServerConfig{
		JwtSecretKey:            jwtKey,
		AllowHttp:               allowHttp,
		Port:                    port,
		AccountsService:         accounts.New(logger, passwordManager, accountsDao),
		ApprovalRequestsService: approvals.New(logger, approvalsDao),
		ConnectionsService:      connections.New(logger, connectionsDao),
		ResourcesService:        resources.New(logger, resourcesDao),
		JobsService:             jobs.New(logger, jobsDao),
		EventsService:           events.New(logger, eventsDao),
	}

	serverConfig.StartServer(context.Background(), logger)
}
