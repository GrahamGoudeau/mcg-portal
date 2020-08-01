class ConnectionsSvc {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getAllConnectionRequests() {
        const response = await this.serverClient.fetch('/api/connection-requests');
        return response.json();
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
        console.log(accountIdToConnectWith);
        var idNumber = parseInt(accountIdToConnectWith, 10);
        return this.serverClient.fetch(`/api/connection-requests`, {
            method: 'POST',
            body: JSON.stringify({
                requesteeID: idNumber,
                message: "",
            })
        })
    }
}

export default ConnectionsSvc;
