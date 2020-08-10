package rest_test

import (
	"bytes"
	"encoding/json"
	"io"
	"math/rand"
	"net/http"
	"testing"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func init() {
	rand.Seed(time.Now().UTC().UnixNano())
}

const (
	serverUrl = "http://localhost:5000"
)

func TestRest(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Rest Suite")
}

func blobToReader(blob map[string]interface{}) io.Reader {
	content, err := json.Marshal(blob)
	if err != nil {
		panic(err)
	}
	return bytes.NewBuffer(content)
}

func generateStringContent() string {
	const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

	b := make([]byte, 20)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}

	return string(b)
}

func expectJsonResponseWithStatus(response *http.Response, status int) {
	Expect(response.StatusCode).To(Equal(status))
	Expect(response.Header.Get("Content-Type")).To(Equal("application/json; charset=utf-8"))
}
