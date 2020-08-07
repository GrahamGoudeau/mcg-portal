const cacheTtl = 3 /*minutes*/ * 60 /*seconds*/ * 1000;

class ResponseBody {
    constructor(jsonBody) {
        this.jsonBody = jsonBody
    }

    json() {
        return this.jsonBody;
    }
}

class Client {
    constructor(hostName, authState, fetchDefaults) {
        this.authState = authState;
        this.fetchDefaults = fetchDefaults;
        this.hostName = hostName;
    }

    fetch(endpoint, opts) {
        const cacheKey = `${this.authState.getBearerToken()}${endpoint}`;
        const enableCache = this.hostName.indexOf('localhost') === -1
            && opts != null
            && opts.enableCache
            && (opts.method == null ? 'GET' : opts.method) === 'GET';

        if (enableCache) {
            const cached = localStorage.getItem(cacheKey);
            if (cached != null) {
                const cachedObj = JSON.parse(cached);
                if (((new Date()) - new Date(cachedObj.lastEditTime)) < cacheTtl) {
                    return new ResponseBody(cachedObj.originalValue);
                } else {
                    localStorage.removeItem(cacheKey);
                }
            }
        }
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
            return r.json();
        }).then(jsonBody => {
            if (enableCache) {
                const toCache = JSON.stringify({
                    originalValue: jsonBody,
                    lastEditTime: new Date(),
                });
                localStorage.setItem(cacheKey, toCache)
            }
            return new ResponseBody(jsonBody);
        })
    }
}

export default Client;
