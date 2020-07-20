class AuthorizationState {
    bearerToken = '';
    email = '';
    admin = false;

    isAdmin() {
        const payload = this.getBearerToken().split('.')[1];
        const decoded = JSON.parse(atob(payload));
        const userClaims = decoded.user_claims;
        return userClaims.is_admin;
    }

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
