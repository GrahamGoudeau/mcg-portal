class AccountsSvc {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getMyAccount() {
        const response = await this.serverClient.fetch('/api/account');
        return response.json();
    }

    async getAccountDetails(accountId) {
        const response = await this.serverClient.fetch('/api/accounts/' + accountId, {
            enableCache: true,
        });
        return response.json();
    }

    async updateAccountInfo(userId, bio, currentRole, currentSchool, currentCompany, firstName, lastName) {
        return this.serverClient.fetch(`/api/accounts/${userId}/makeUpdate`, {
            method: 'POST',
            body: JSON.stringify({
                bio,
                currentRole,
                currentSchool,
                currentCompany,
                firstName,
            })
        })
    }

    async getPotentialConnections() {
        return (await this.serverClient.fetch('/api/accounts', {
            enableCache: true,
        })).json()
    }
}

export default AccountsSvc;
