class ConnectionsSvc {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async resolveConnectionRequest(requestId) {
        return this.serverClient.fetch(`/api/connection-requests/${requestId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                resolved: true,
            })
        })
    }

    async initiateConnectionRequest(accountIdToConnectWith) {
        var idNumber = parseInt(accountIdToConnectWith, 10);
        return this.serverClient.fetch(`/api/v1/secure/connections/`, {
            method: 'POST',
            body: JSON.stringify({
                requesteeID: idNumber,
                message: "",
            })
        })
    }
}

export default ConnectionsSvc;
