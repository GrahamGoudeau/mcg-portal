package rest_test

import (
	"net/http"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Registrations", func() {
	client := http.DefaultClient

	When("registering a new user", func() {
		Context("and the user fills out all fields", func() {
			It("handles the registration", func() {
				req, err := http.NewRequest(http.MethodPost, serverUrl + "/api/v1/registrations/", blobToReader(map[string]interface{}{
					"email": generateStringContent(),
					"password": generateStringContent(),
					"firstName": generateStringContent(),
					"lastName": generateStringContent(),
					"enrollmentStatus": "Alum",
				}))
				Expect(err).NotTo(HaveOccurred())
				req.Header.Set("Content-Type", "application/json")

				response, err := client.Do(req)
				Expect(err).NotTo(HaveOccurred())
				expectJsonResponseWithStatus(response, 200)
			})
		})

		Context("and the user leaves off enrollment status", func() {
			It("handles the registration", func() {
				req, err := http.NewRequest(http.MethodPost, serverUrl + "/api/v1/registrations/", blobToReader(map[string]interface{}{
					"email": generateStringContent(),
					"password": generateStringContent(),
					"firstName": generateStringContent(),
					"lastName": generateStringContent(),
				}))
				Expect(err).NotTo(HaveOccurred())
				req.Header.Set("Content-Type", "application/json")

				response, err := client.Do(req)
				Expect(err).NotTo(HaveOccurred())
				expectJsonResponseWithStatus(response, 200)
			})
		})
	})
})
