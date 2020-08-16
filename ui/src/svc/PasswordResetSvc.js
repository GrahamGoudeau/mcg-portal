class PasswordResetSvc {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async validateToken(email, token) {
        const response = await this.serverClient.fetch('/api/v1/password-reset/validation/', {
            method: 'POST',
            body: JSON.stringify({
                token,
                email,
            })
        });
        const body = await response.json();
        return body.isValid;
    }

    async sendResetEmail(email) {
        const response = await this.serverClient.fetch('/api/v1/password-reset/', {
            method: 'POST',
            body: JSON.stringify({
                email,
            })
        });
        return response.json();
    }

    async useResetToken(token, newPassword) {
        await this.serverClient.fetch('/api/v1/password-reset/tokens/', {
            method: 'POST',
            body: JSON.stringify({
                token,
                newPassword,
            })
        })
    }
}

export default PasswordResetSvc;
