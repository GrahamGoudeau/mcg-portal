class AuthService {
    constructor(hostName, authorizationState, serverClient) {
        this.hostname = hostName;
        this.authorizationState = authorizationState;
        this.serverClient = serverClient;

    }

    // return a boolean for the state of the log in attempt. Also update the auth state singleton
    async logIn(email, password) {
        const url = `${this.hostname}/api/v1/login/`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
            const body = await response.json();
            if (response.ok) {
                this.authorizationState.setBearerToken(body.jwt, email);
            }
            return body;
        } catch (e) {
            this.authorizationState.setBearerToken("", "");
            throw e;
        }
    }

    async createAccount(firstName, lastName, email, password, enrollmentType) {
        const endpoint = `/api/v1/registrations/`;

        return this.serverClient.fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
                firstName,
                lastName,
                enrollmentType,
            })
        }).then(r => {
            return r.json();
        }).then(body => {
            if (body.jwt) {
                this.authorizationState.setBearerToken(body.jwt, email);
                return '';
            } else if (body.message === 'duplicate') {
                return 'An account with this email already exists or is pending approval.';
            } else {
                return body.message;
            }
        }).catch(e => {
            console.log("Unexpected error", e);
            return "Unexpected error"
        })
    }

}
export default AuthService;
