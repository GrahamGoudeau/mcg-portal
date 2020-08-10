package rest

import (
	"net/http"
	"strconv"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
)

func statusWithMessage(context *gin.Context, status int, message string) {
	type messageJson struct {
		Message string `json:"message"`
	}
	context.JSON(status, &messageJson{
		Message: message,
	})
}

func getUserCredentialsFromContext(context *gin.Context) *accounts.UserCredentials {
	claims := jwt.ExtractClaims(context)
	return &accounts.UserCredentials{
		Id:      int64(claims["id"].(float64)),
		IsAdmin: claims["isAdmin"].(bool),
	}
}

// user's responsibility to kill their own handler if this returns true
func validateUserOwnsResource(c *gin.Context, paramName string) (sentUnauthorizedResponse bool) {
	creds := getUserCredentialsFromContext(c)
	userIdPathParam, err := strconv.ParseInt(c.Param(paramName), 10, 64)
	if err != nil {
		panic(err)
	}

	if creds.Id != userIdPathParam {
		statusWithMessage(c, http.StatusUnauthorized, "unauthorized")
		return true
	}
	return false
}
