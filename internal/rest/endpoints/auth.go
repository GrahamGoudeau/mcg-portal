package endpoints

import (
	"net/http"
	"time"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
	"portal.mcgyouthandarts.org/pkg/services/metrics"
)

type LoginResponse struct {
	Jwt               string `json:"jwt"`
	HasLoggedInBefore bool   `json:"hasLoggedInBefore"`
}

func GetAuthMiddleware(
	logger *zap.SugaredLogger,
	jwtSecretKey string,
	adminOnlyRoutes []string,
	accountsService accounts.Service,
	metricsService metrics.Service,
) *jwt.GinJWTMiddleware {
	adminOnlySet := map[string]struct{}{}
	for _, route := range adminOnlyRoutes {
		adminOnlySet[route] = struct{}{}
	}

	authMiddleware, err := jwt.New(&jwt.GinJWTMiddleware{
		SigningAlgorithm: "HS256",
		Realm:            "test zone",
		Key:              []byte(jwtSecretKey),
		Timeout:          time.Hour * 24,
		Authenticator: func(c *gin.Context) (interface{}, error) {
			type loginRequest struct {
				Email    string `json:"email"`
				Password string `json:"password"`
			}

			req := loginRequest{}
			err := c.ShouldBindJSON(&req)
			if err != nil {
				logger.Info("Failed to find auth credentials")
				return nil, jwt.ErrFailedAuthentication
			}

			creds, err := accountsService.Authenticate(req.Email, req.Password)
			if err != nil {
				logger.Errorf("Failed to authenticate %s: %+v", req.Email, err)
				return nil, jwt.ErrFailedAuthentication
			}
			if creds == nil {
				logger.Infof("Failed login attempt for user %s", req.Email)
				return nil, jwt.ErrFailedAuthentication
			}

			logger.Infof("Successfully logged in user %s", req.Email)

			// we'll retrieve this later so we can figure out if we've logged in before
			c.Set("userId", creds.Id)

			return creds, nil
		},
		IdentityHandler: func(context *gin.Context) interface{} {
			return getUserCredentialsFromContext(context)
		},
		PayloadFunc: func(data interface{}) jwt.MapClaims {
			userCreds, ok := data.(*accounts.UserCredentials)
			if !ok || userCreds == nil {
				logger.Errorf("Failed to convert user credentials during auth flow: %+v", data)
				return jwt.MapClaims{}
			}

			return jwt.MapClaims{
				"id":      userCreds.Id,
				"isAdmin": userCreds.IsAdmin,
			}
		},
		Authorizator: func(data interface{}, c *gin.Context) bool {
			userCreds, ok := data.(*accounts.UserCredentials)
			if !ok || userCreds == nil {
				logger.Errorf("Failed to convert user credentials during request flow: %+v", data)
				return false
			}

			logger.Infof("User %d accessing %s %s", userCreds.Id, c.Request.Method, c.Request.URL.Path)

			_, isAdminRestrictedPath := adminOnlySet[c.Request.URL.Path]

			// a user is authorized if:
			//  - they're an admin
			//  - or if  the path they're hitting is NOT admin-restricted
			return userCreds.IsAdmin || !isAdminRestrictedPath
		},
		LoginResponse: func(context *gin.Context, _ int, token string, _ time.Time) {
			userId := context.GetInt64("userId")
			hasLoggedInBefore, err := accountsService.HasUserSignedInBefore(userId)
			if err != nil {
				logger.Errorf("Could not determine if user %d has signed in before: %+v", userId, err)
			}

			go metricsService.RecordLogIn(userId)

			context.JSON(http.StatusOK, &LoginResponse{
				Jwt:               token,
				HasLoggedInBefore: hasLoggedInBefore,
			})
		},
		Unauthorized: func(c *gin.Context, code int, message string) {
			c.JSON(code, gin.H{
				"code":    code,
				"message": message,
			})
		},
		// TokenLookup is a string in the form of "<source>:<name>" that is used
		// to extract token from the request.
		// Optional. Default value "header:Authorization".
		// Possible values:
		// - "header:<name>"
		// - "query:<name>"
		// - "cookie:<name>"
		// - "param:<name>"
		TokenLookup: "header: Authorization, query: token, cookie: jwt",
		// TokenLookup: "query:token",
		// TokenLookup: "cookie:token",

		// TokenHeadName is a string in the header. Default value is "Bearer"
		TokenHeadName: "Bearer",

		// TimeFunc provides the current time. You can override it to use another time value. This is useful for testing or if your server uses a different time zone than your tokens.
		TimeFunc: time.Now,
	})
	if err != nil {
		panic(err)
	}

	return authMiddleware
}
