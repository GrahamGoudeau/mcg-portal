package main

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/internal/dao/postgres"
	"portal.mcgyouthandarts.org/internal/rest/server"
	"portal.mcgyouthandarts.org/pkg/services/accounts/auth"
)

func main() {
	_ = context.Background()
	devCfg := zap.NewProductionConfig()
	devCfg.Sampling = nil
	prodLogger, err := devCfg.Build()
	if err != nil {
		panic(err)
	}
	defer prodLogger.Sync()
	logger := prodLogger.Sugar()

	dbUrl := getEnvVarOrDie("DATABASE_URL")
	maxOpenConnections := getIntVarOrDefault("DATABASE_MAX_CON", 15)
	maxIdleConnections := getIntVarOrDefault("DATABASE_MAX_IDLE", 15)
	maxConnLifetimeMinutes := getIntVarOrDefault("DATABASE_MAX_LIFETIME_MINS", 5)

	logger.Infof("Starting postgres with options: %d %d %d", maxOpenConnections, maxIdleConnections, maxConnLifetimeMinutes)
	rootDao := postgres.NewDao(postgres.Opts{
		MaxOpenCons:           maxOpenConnections,
		MaxIdleCons:           maxIdleConnections,
		MaxConLifetimeMinutes: maxConnLifetimeMinutes,
		DbUrl:                 dbUrl,
	}, logger)

	portStr := getEnvVarOrDie("PORT")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		panic(err)
	}
	jwtKey := getEnvVarOrDie("JWT_KEY")
	allowHttp := os.Getenv("ALLOW_HTTP") != ""

	server.Start(
		logger,
		port,
		jwtKey,
		rootDao,
		rootDao,
		rootDao,
		rootDao,
		allowHttp,
		auth.NewPasswordManager(),
	)
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
