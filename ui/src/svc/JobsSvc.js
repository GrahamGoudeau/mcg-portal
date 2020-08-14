class JobsService {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getAllJobs() {
        const response = await this.serverClient.fetch('/api/v1/secure/jobs/', {
            enableCache: true,
        });
        return (await response.json()).jobs;
    }

    async getJob(jobId) {
        return (await this.serverClient.fetch('/api/job-postings/' + jobId, {
            enableCache: true,
        })).json();
    }
}

export default JobsService;
