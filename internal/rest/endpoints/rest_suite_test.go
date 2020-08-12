package endpoints_test

import (
	"bytes"
	"encoding/json"
	"io"
	"io/ioutil"
	"math/rand"
	"net/http"
	"testing"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"portal.mcgyouthandarts.org/internal/rest/endpoints"
)

func init() {
	rand.Seed(time.Now().UTC().UnixNano())
}

var (
	serverUrl = "http://localhost:5000"
)

func TestEndpoints(t *testing.T) {
	//BeforeSuite(func() {
	//	port := 9000 + rand.Intn(500)
	//	serverUrl = serverUrl + fmt.Sprintf("%d", port)
	//
	//	prodLogger, err := zap.NewProduction()
	//	if err != nil {
	//		panic(err)
	//	}
	//	defer prodLogger.Sync()
	//	logger := prodLogger.Sugar()
	//
	//	dbUrl := "postgres://postgres:docker@host.docker.internal:5432/postgres?sslmode=disable"
	//	maxOpenConnections := 25
	//	maxIdleConnections := 25
	//	maxConnLifetimeMinutes := 5
	//
	//	logger.Infof("Starting postgres with options: %d %d %d", maxOpenConnections, maxIdleConnections, maxConnLifetimeMinutes)
	//	rootDao := postgres.New(postgres.Opts{
	//		MaxOpenCons:           maxOpenConnections,
	//		MaxIdleCons:           maxIdleConnections,
	//		MaxConLifetimeMinutes: maxConnLifetimeMinutes,
	//		DbUrl: dbUrl,
	//	})
	//	jwtKey := "testing-jwt-key"
	//	allowHttp := true
	//
	//	server.Start(
	//		logger,
	//		port,
	//		jwtKey,
	//		rootDao,
	//		allowHttp,
	//		auth.NewPasswordManager(),
	//	)
	//})
	RegisterFailHandler(Fail)
	RunSpecs(t, "Endpoints Suite")
}

func blobToReader(blob map[string]interface{}) io.Reader {
	return ifaceToReader(blob)
}

func ifaceToReader(iface interface{}) io.Reader {
	content, err := json.Marshal(iface)
	if err != nil {
		panic(err)
	}
	return bytes.NewBuffer(content)
}

func generateStringContent() string {
	const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

	b := make([]byte, 50)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}

	return string(b)
}

func expectJsonResponseWithStatus(response *http.Response, status int) {
	Expect(response.StatusCode).To(Equal(status))
	Expect(response.Header.Get("Content-Type")).To(Equal("application/json; charset=utf-8"))
}

func setAuthHeader(request *http.Request, token string) {
	request.Header.Set("Authorization", "Bearer "+token)
}

type createdUser struct {
	approvalRequestId int64
	email             string
	password          string
	firstName         string
	lastName          string
}

func createUser(client *http.Client) *createdUser {
	email := generateStringContent()
	password := generateStringContent()
	firstName := generateStringContent()
	lastName := generateStringContent()
	req, err := http.NewRequest(http.MethodPost, serverUrl+"/api/v1/registrations/", blobToReader(map[string]interface{}{
		"email":     email,
		"password":  password,
		"firstName": firstName,
		"lastName":  lastName,
	}))
	Expect(err).NotTo(HaveOccurred())
	req.Header.Set("Content-Type", "application/json")

	response, err := client.Do(req)
	Expect(err).NotTo(HaveOccurred())
	expectJsonResponseWithStatus(response, http.StatusCreated)
	body, err := ioutil.ReadAll(response.Body)
	Expect(err).NotTo(HaveOccurred())
	defer response.Body.Close()
	registrationResponse := endpoints.RegistrationResponse{}
	Expect(json.Unmarshal(body, &registrationResponse)).NotTo(HaveOccurred())
	return &createdUser{
		approvalRequestId: registrationResponse.ApprovalRequestId,
		email:             email,
		password:          password,
		firstName:         firstName,
		lastName:          lastName,
	}
}

func loginAsUser(client *http.Client, email, password string) (jwt string) {
	req, err := http.NewRequest(http.MethodPost, serverUrl+"/api/v1/login/", blobToReader(map[string]interface{}{
		"email":    email,
		"password": password,
	}))
	Expect(err).NotTo(HaveOccurred())
	req.Header.Set("Content-Type", "application/json")

	response, err := client.Do(req)
	Expect(err).NotTo(HaveOccurred())
	expectJsonResponseWithStatus(response, 200)
	body, err := ioutil.ReadAll(response.Body)
	defer response.Body.Close()
	Expect(err).NotTo(HaveOccurred())
	loginResonse := endpoints.LoginResponse{}
	Expect(json.Unmarshal(body, &loginResonse)).NotTo(HaveOccurred())
	return loginResonse.Jwt
}

func expectResponseAndParseBody(client *http.Client, req *http.Request, status int, parseInto interface{}) {
	resp, err := client.Do(req)
	Expect(err).NotTo(HaveOccurred())
	Expect(resp.StatusCode).To(Equal(status))
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	Expect(err).NotTo(HaveOccurred())
	Expect(json.Unmarshal(body, parseInto)).NotTo(HaveOccurred())
}
