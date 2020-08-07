class JobsService {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getAllJobs() {
        const response = await this.serverClient.fetch('/api/all_job_postings', {
            enableCache: true,
        });
        return response.json();
    }

    async getJob(jobId) {
        return (await this.serverClient.fetch('/api/job-postings/' + jobId, {
            enableCache: true,
        })).json();
    }
}

export default JobsService;
