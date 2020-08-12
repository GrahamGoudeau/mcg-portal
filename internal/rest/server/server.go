package server

import (
	"context"

	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/internal/rest/endpoints"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/accounts/auth"
	"portal.mcgyouthandarts.org/pkg/services/approvals"
	"portal.mcgyouthandarts.org/pkg/services/connections"
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
	}

	serverConfig.StartServer(context.Background(), logger)
}
