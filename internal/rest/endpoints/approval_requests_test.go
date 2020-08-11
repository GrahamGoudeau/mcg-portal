package endpoints_test

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"portal.mcgyouthandarts.org/internal/rest/endpoints"
)

var _ = Describe("ApprovalRequests", func() {
	client := http.DefaultClient
	adminJwt := ""
	nonAdminJwt := ""

	BeforeEach(func() {
		adminJwt = loginAsUser(client, "admin-for-unit-tests", "password")
		nonAdminJwt = loginAsUser(client, "non-admin-for-unit-tests", "password")
	})

	It("does not allow non-admins to access the endpoint", func() {
		req, err := http.NewRequest(http.MethodPut, serverUrl+"/api/v1/secure/approval-requests/123123123", blobToReader(map[string]interface{}{}))
		Expect(err).NotTo(HaveOccurred())
		setAuthHeader(req, nonAdminJwt)

		response, err := client.Do(req)
		Expect(err).NotTo(HaveOccurred())
		expectJsonResponseWithStatus(response, 401)
	})

	When("approving account changes", func() {
		It("can approve a new account", func() {
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

			newJwt := loginAsUser(client, createdUser.email, createdUser.password)
			Expect(newJwt).NotTo(BeEmpty(), "New JWT should not be empty")
		})

		It("can approve edits to an account", func() {
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

			newJwt := loginAsUser(client, createdUser.email, createdUser.password)
			Expect(newJwt).NotTo(BeEmpty(), "New JWT should not be empty")

			testBio := "this is my test bio"
			req, err = http.NewRequest(http.MethodPut, serverUrl+"/api/v1/secure/accounts/me", blobToReader(map[string]interface{}{
				"firstName": createdUser.firstName,
				"lastName":  createdUser.lastName,
				"bio":       testBio,
			}))
			setAuthHeader(req, newJwt)
			response, err = client.Do(req)
			Expect(err).NotTo(HaveOccurred())
			expectJsonResponseWithStatus(response, http.StatusOK)
			body, err := ioutil.ReadAll(response.Body)
			Expect(err).NotTo(HaveOccurred())
			defer response.Body.Close()
			approvalSubmissionResponse := endpoints.ApprovalSubmissionResponse{}
			Expect(json.Unmarshal(body, &approvalSubmissionResponse)).NotTo(HaveOccurred())

			req, err = http.NewRequest(http.MethodPut, serverUrl+"/api/v1/secure/approval-requests/"+fmt.Sprintf("%d", approvalSubmissionResponse.ApprovalRequestId), blobToReader(map[string]interface{}{
				"response": "Approved",
			}))
			Expect(err).NotTo(HaveOccurred())
			setAuthHeader(req, adminJwt)
			response, err = client.Do(req)
			Expect(err).NotTo(HaveOccurred())
			expectJsonResponseWithStatus(response, http.StatusOK)

			req, err = http.NewRequest(http.MethodGet, serverUrl+"/api/v1/secure/accounts/me", nil)
			setAuthHeader(req, newJwt)
			response, err = client.Do(req)
			Expect(err).NotTo(HaveOccurred())
			expectJsonResponseWithStatus(response, http.StatusOK)
			body, err = ioutil.ReadAll(response.Body)
			Expect(err).NotTo(HaveOccurred())
			defer response.Body.Close()

			Expect(string(body)).To(ContainSubstring("this is my test bio"))
		})
	})
})
