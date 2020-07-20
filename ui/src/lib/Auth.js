class AuthorizationState {
    bearerToken = '';
    email = '';

    isLoggedIn() {
        const storedToken = localStorage.getItem('bearer');
        const storedEmail = localStorage.getItem('email');
        if (storedToken !== '' && storedToken != null) {
            this.bearerToken = storedToken;
        }
        if (storedEmail !== '' && storedEmail != null) {
            this.email = storedEmail;
        }

        return this.bearerToken !== '';
    }

    getBearerToken() {
        return this.bearerToken;
    }

    setBearerToken(newToken, email) {
        this.bearerToken = newToken;
        this.email = email;
        localStorage.setItem('bearer', newToken);
        localStorage.setItem('email', email);
    }
}

export default AuthorizationState
