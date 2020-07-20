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
}

export default ConnectionsSvc;
