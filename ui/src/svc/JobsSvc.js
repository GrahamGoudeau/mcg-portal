class JobsService {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getAllJobs() {
        const response = await this.serverClient.fetch('/api/all_job_postings');
        return response.json();
    }

    async getJob(jobId) {
        return (await this.serverClient.fetch('/api/job-postings/' + jobId)).json();
    }
}

export default JobsService;
