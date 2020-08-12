package endpoints_test

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"portal.mcgyouthandarts.org/internal/rest/endpoints"
	"portal.mcgyouthandarts.org/pkg/services/accounts"
)

var _ = Describe("Connections", func() {
	client := http.DefaultClient
	userOneJwt := ""
	userTwoJwt := ""
	userTwoId := int64(0)

	BeforeEach(func() {
		adminJwt := loginAsUser(client, "admin-for-unit-tests", "password")
		userOneJwt = loginAsUser(client, "non-admin-for-unit-tests", "password")

		createdUser := createUser(client)
		requestIdStr := fmt.Sprintf("%d", createdUser.approvalRequestId)

		req, err := http.NewRequest(http.MethodPut, serverUrl+"/api/v1/secure/approval-requests/"+requestIdStr, blobToReader(map[string]interface{}{
			"response": "Approved",
		}))
		Expect(err).NotTo(HaveOccurred())
		setAuthHeader(req, adminJwt)

		response, err := client.Do(req)
		Expect(err).NotTo(HaveOccurred())
		expectJsonResponseWithStatus(response, http.StatusOK)

		userTwoJwt = loginAsUser(client, createdUser.email, createdUser.password)
		Expect(userTwoJwt).NotTo(BeEmpty(), "New JWT should not be empty")

		req, err = http.NewRequest(http.MethodGet, serverUrl+"/api/v1/secure/accounts/me", nil)
		Expect(err).NotTo(HaveOccurred())
		setAuthHeader(req, userTwoJwt)

		response, err = client.Do(req)
		Expect(err).NotTo(HaveOccurred())
		expectJsonResponseWithStatus(response, http.StatusOK)
		body, err := ioutil.ReadAll(response.Body)
		Expect(err).NotTo(HaveOccurred())
		account := accounts.Account{}
		Expect(json.Unmarshal(body, &account)).NotTo(HaveOccurred())
		userTwoId = account.UserId
		Expect(userTwoId).NotTo(Equal(int64(0)))
	})

	When("creating a connection request", func() {
		It("succeeds", func() {
			req, err := http.NewRequest(http.MethodPost, serverUrl+"/api/v1/secure/connections", ifaceToReader(&endpoints.InitiateConnectionsRequest{
				RequesteeId: userTwoId,
			}))
			Expect(err).NotTo(HaveOccurred())
			setAuthHeader(req, userOneJwt)
			response, err := client.Do(req)
			Expect(err).NotTo(HaveOccurred())
			expectJsonResponseWithStatus(response, http.StatusCreated)
		})
	})
})
