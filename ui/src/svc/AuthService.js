class AuthService {
    constructor(hostName, authorizationState, fetchDefaults) {
        this.hostname = hostName;
        this.authorizationState = authorizationState;
        this.fetchDefaults = fetchDefaults;
    }

    // return a boolean for the state of the log in attempt. Also update the auth state singleton
    async logIn(email, password) {
        const url = `${this.hostname}/api/login`;
        console.log(`Logging in to ${url}`);
        try {
            const response = await fetch(url, {
                ...this.fetchDefaults,
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
            if (response.ok) {
                this.authorizationState.setBearerToken((await response.json()).jwt, email);
            }
            return response.ok
        } catch (e) {
            this.authorizationState.setBearerToken("", "");
            console.log(e);
            throw e;
        }
    }
}

export default AuthService;
