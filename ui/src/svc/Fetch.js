class Client {
    constructor(authState) {
        this.authState = authState
    }

    fetch(url, opts) {
        return fetch(url, opts).then(r => {
            this.authState.setBearerToken('');
            if (r.status === 401) {
                alert("You have been logged out. You will be redirected to the login page!");
                window.location.reload(true);
                return null;
            }
            return r;
        })
    }
}

export default Client;
