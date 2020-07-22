class ResourcesService {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getResourcesForUser(userId) {
        const response = await this.serverClient.fetch(`/api/accounts/${userId}/resources`);
        return response.json();
    }

    async deleteResource(userId, resourceId) {
        return this.serverClient.fetch(`/api/accounts/${userId}/resources/${resourceId}`, {
            method: 'DELETE',
        })
    }
}

export default ResourcesService;
