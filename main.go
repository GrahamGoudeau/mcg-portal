package main

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/internal/rest"
	"portal.mcgyouthandarts.org/pkg/dao/postgres"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/accounts/auth"
)

func main() {
	ctx := context.Background()
	prodLogger, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}
	defer prodLogger.Sync()
	logger := prodLogger.Sugar()

	dbUrl := getEnvVarOrDie("DATABASE_URL")
	maxOpenConnections := getIntVarOrDefault("DATABASE_MAX_CON", 25)
	maxIdleConnections := getIntVarOrDefault("DATABASE_MAX_IDLE", 25)
	maxConnLifetimeMinutes := getIntVarOrDefault("DATABASE_MAX_LIFETIME_MINS", 5)

	logger.Infof("Starting postgres with options: %d %d %d", maxOpenConnections, maxIdleConnections, maxConnLifetimeMinutes)

	postgresDao := postgres.New(postgres.Opts{
		MaxOpenCons:           maxOpenConnections,
		MaxIdleCons:           maxIdleConnections,
		MaxConLifetimeMinutes: maxConnLifetimeMinutes,
		DbUrl: dbUrl,
	})

	portStr := getEnvVarOrDie("PORT")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		panic(err)
	}
	jwtKey := getEnvVarOrDie("JWT_KEY")

	passwordManager := auth.NewPasswordManager()

	serverConfig := rest.ServerConfig{
		JwtSecretKey: jwtKey,
		AllowHttp:    os.Getenv("ALLOW_HTTP") != "",
		Port: port,
		AccountsService: accounts.New(logger, passwordManager, postgresDao),
	}

	serverConfig.StartServer(ctx, logger)
}

func getEnvVarOrDie(name string) string {
	value := os.Getenv(name)
	if value == "" {
		panic(fmt.Sprintf("Must set env var %s", name))
	}
	return value
}

func getIntVarOrDie(name string) int {
	value := getEnvVarOrDie(name)
	intVal, err := strconv.Atoi(value)
	if err != nil {
		panic(err)
	}
	return intVal
}

func getIntVarOrDefault(name string, defaultVal int) int {
	value := os.Getenv(name)
	if value == "" {
		return defaultVal
	}

	intVal, err := strconv.Atoi(value)
	if err != nil {
		panic(err)
	}
	return intVal
}
