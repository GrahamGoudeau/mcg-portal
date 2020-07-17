import React from "react";

class AuthService {
    constructor(hostName, authorizationState, serverClient) {
        this.hostname = hostName;
        this.authorizationState = authorizationState;
        this.serverClient = serverClient;

    }

    // return a boolean for the state of the log in attempt. Also update the auth state singleton
    async logIn(email, password) {
        const url = `${this.hostname}/api/login`;
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
            if (response.ok) {
                this.authorizationState.setBearerToken((await response.json()).jwt, email);
            }
            return response.ok
        } catch (e) {
            this.authorizationState.setBearerToken("", "");
            throw e;
        }
    }

    async createAccount(firstName, lastName, email, password, enrollmentStatus) {
        const url = `${this.hostname}/api/accounts`;
        // const body = {
        //     email,
        //     password,
        //     firstName,
        //     lastName,
        //     enrollmentStatus,
        // };
        //
        // if (enrollmentStatus != null) {
        //     body.enrollmentStatus = enrollmentStatus;
        // }
        return this.serverClient.fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
                firstName,
                lastName,
                enrollmentStatus,
            })
        }).then(r => {
            return r.json();
        }).then(body => {
            if (body.jwt) {
                this.authorizationState.setBearerToken(body.jwt, email);
                return '';
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
