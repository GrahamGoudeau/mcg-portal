class AuthorizationState {
    bearerToken = '';
    email = '';

    isLoggedIn() {
        const storedToken = localStorage.getItem('bearer');
        if (storedToken !== '' && storedToken != null) {
            this.bearerToken = storedToken;
        }

        return this.bearerToken !== '';
    }

    getBearerToken() {
        return this.bearerToken;
    }

    setBearerToken(newToken, email) {
        console.trace("Setting token", newToken);
        this.bearerToken = newToken;
        localStorage.setItem('bearer', newToken)
    }
}

export default AuthorizationState