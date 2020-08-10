package auth

import (
	"golang.org/x/crypto/bcrypt"
)

type PasswordManager interface {
	HashAndSalt(pwd string) (string, error)
	Validate(pwdToCheck, hashedAndSaltedPassword string) (bool, error)
}

type passwordManager struct {}
func NewPasswordManager() PasswordManager {
	return &passwordManager{}
}

func (p *passwordManager) HashAndSalt(pwd string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(pwd), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hash), nil
}

func (p *passwordManager) Validate(pwdToCheck, hashedAndSaltedPassword string) (bool, error) {
	byteHash := []byte(hashedAndSaltedPassword)
	err := bcrypt.CompareHashAndPassword(byteHash, []byte(pwdToCheck))
	if err != nil {
		return false, err
	}

	return true, nil
}
