class AuthorizationState {
    bearerToken = '';
    email = '';

    isLoggedIn() {
        return this.bearerToken !== '';
    }

    getBearerToken() {
        return this.bearerToken;
    }

    setBearerToken(newToken, email) {
        this.bearerToken = newToken;
    }
}

export default AuthorizationState
