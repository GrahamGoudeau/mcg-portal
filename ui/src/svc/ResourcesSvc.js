class ResourcesService {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getAllUsersOfferingResources() {
        const response = await this.serverClient.fetch(`/api/v1/secure/resources/`, {
            method: 'GET',
        })
        const body = await response.json()
        return body.users;
    }

    async getResourcesForUser(userId, enableCache = false) {
        const allUsers = await this.getAllUsersOfferingResources();
        return allUsers.find(u => u.userId === userId)
    }

    async deleteResource(resourceId) {
        return this.serverClient.fetch(`/api/v1/secure/resources/${resourceId}`, {
            method: 'DELETE',
        })
    }

    async createResource(resourceName) {
        return this.serverClient.fetch(`/api/v1/secure/resources/`, {
            method: 'POST',
            body: JSON.stringify({
                name: resourceName,
            })
        })
    }
}

export default ResourcesService;
