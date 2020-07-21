class ResourcesService {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getResourcesForUser(userId) {
        const response = await this.serverClient.fetch(`/api/accounts/${userId}/resources`);
        return response.json();
    }
}

export default ResourcesService;
