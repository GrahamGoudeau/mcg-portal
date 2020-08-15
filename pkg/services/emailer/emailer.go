package emailer

// All these methods are async. They can be safely called without blocking the current goroutine
type Service interface {
	AccountConfirmed(userEmail, userName string)
	PasswordResetToken(userEmail, token string)
}
