class ApprovalRequestSvc {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getAllApprovalRequests() {
        const response = await this.serverClient.fetch('/api/v1/secure/approval-requests/')
        const body = await response.json();
        return body.requests;
    }

    async approveRequest(requestId) {
        await this.serverClient.fetch('/api/v1/secure/approval-requests/' + requestId + '/', {
            method: 'PUT',
            body: JSON.stringify({
                response: 'Approved',
            })
        })
    }

    async denyRequest(requestId) {
        await this.serverClient.fetch('/api/v1/secure/approval-requests/' + requestId + '/', {
            method: 'PUT',
            body: JSON.stringify({
                response: 'Rejected',
            })
        })
    }
}

export default ApprovalRequestSvc;
