class AccountsSvc {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getMyAccount() {
        const response = await this.serverClient.fetch('/api/v1/secure/me/');
        return response.json();
    }

    async getAccountDetails(accountId) {
        const response = await this.serverClient.fetch('/api/v1/secure/accounts/' + accountId, {
            enableCache: true,
        });
        return response.json();
    }

    async updateAccountInfo(bio, currentRole, currentSchool, currentCompany, firstName, lastName) {
        return this.serverClient.fetch(`/api/v1/secure/me/`, {
            method: 'PUT',
            body: JSON.stringify({
                bio,
                currentRole,
                currentSchool,
                currentCompany,
                firstName,
                lastName,
            })
        })
    }
}

export default AccountsSvc;
