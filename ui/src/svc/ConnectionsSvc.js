class ConnectionsSvc {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getAllConnectionRequests() {
        const response = await this.serverClient.fetch('/api/connection-requests');
        return response.json();
    }
}

export default ConnectionsSvc;
