class AccountsSvc {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getMyAccount() {
        const response = await this.serverClient.fetch('/api/account');
        return response.json();
    }
}

export default AccountsSvc;
