package rest_test

import (
	"net/http"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Auth", func() {
	client := http.DefaultClient

	When("signing in with a non-existent user", func() {
		It("fails", func() {
			req, err := http.NewRequest(http.MethodPost, serverUrl + "/api/v1/login/", blobToReader(map[string]interface{}{
				"email": generateStringContent(),
				"password": generateStringContent(),
			}))
			Expect(err).NotTo(HaveOccurred())
			req.Header.Set("Content-Type", "application/json")

			response, err := client.Do(req)
			Expect(err).NotTo(HaveOccurred())
			expectJsonResponseWithStatus(response, 401)
		})
	})

	When("signing in to an existing user", func() {
		Context("and using the wrong password", func() {
			It("fails", func() {
				email := generateStringContent()
				req, err := http.NewRequest(http.MethodPost, serverUrl + "/api/v1/registrations/", blobToReader(map[string]interface{}{
					"email": email,
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

				req, err = http.NewRequest(http.MethodPost, serverUrl + "/api/v1/login/", blobToReader(map[string]interface{}{
					"email": email,
					"password": generateStringContent(),
				}))
				Expect(err).NotTo(HaveOccurred())
				req.Header.Set("Content-Type", "application/json")

				response, err = client.Do(req)
				Expect(err).NotTo(HaveOccurred())
				expectJsonResponseWithStatus(response, 401)
			})
		})

		Context("and using the proper credentials", func() {
			Context("but the account has not been approved yet", func() {
				It("fails", func() {
					email := generateStringContent()
					password := generateStringContent()
					req, err := http.NewRequest(http.MethodPost, serverUrl + "/api/v1/registrations/", blobToReader(map[string]interface{}{
						"email": email,
						"password": password,
						"firstName": generateStringContent(),
						"lastName": generateStringContent(),
						"enrollmentStatus": "Alum",
					}))
					Expect(err).NotTo(HaveOccurred())
					req.Header.Set("Content-Type", "application/json")

					response, err := client.Do(req)
					Expect(err).NotTo(HaveOccurred())
					expectJsonResponseWithStatus(response, 200)

					req, err = http.NewRequest(http.MethodPost, serverUrl + "/api/v1/login/", blobToReader(map[string]interface{}{
						"email": email,
						"password": password,
					}))
					Expect(err).NotTo(HaveOccurred())
					req.Header.Set("Content-Type", "application/json")

					response, err = client.Do(req)
					Expect(err).NotTo(HaveOccurred())
					expectJsonResponseWithStatus(response, 401)
				})
			})
		})

		Context("and using the testing admin credentials", func() {
			It("succeeds", func() {
				req, err := http.NewRequest(http.MethodPost, serverUrl + "/api/v1/login/", blobToReader(map[string]interface{}{
					"email": "test@example.com",
					"password": "password",
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
