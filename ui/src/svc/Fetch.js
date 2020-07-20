class Client {
    constructor(hostName, authState, fetchDefaults) {
        this.authState = authState;
        this.fetchDefaults = fetchDefaults;
        this.hostName = hostName;
    }

    fetch(endpoint, opts) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.authState.isLoggedIn()) {
            headers['Authorization'] = `Bearer ${this.authState.getBearerToken()}`
        }

        return fetch(`${this.hostName}${endpoint}`, {
            ...this.fetchDefaults,
            ...opts,
            headers,
        }).then(r => {
            if (r.status === 401) {
                this.authState.setBearerToken('');
                alert("You have been logged out. You will be redirected to the login page!");
                window.location.reload(true);
                return null;
            }
            return r;
        })
    }
}

export default Client;
