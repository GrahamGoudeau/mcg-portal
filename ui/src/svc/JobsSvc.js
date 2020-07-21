class JobsService {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getAllJobs() {
        const response = await this.serverClient.fetch('/api/all_job_postings');
        return response.json();
    }
}

export default JobsService;
