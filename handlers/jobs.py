from datetime import datetime

class JobHandler:
    def __init__(self, db, logger):
        self.db = db
        self.logger = logger

    def post_job(self, poster_id, title, description, location):
        self.logger.info("User %s wants to creates a job posting: %s\nDescription: %s \nLocation: %s", poster_id, title, description, location)
        self.db.create_job(poster_id, title, datetime.today().strftime('%Y-%m-%d'), description, location)

    def approveJobPosting(self, jobPostingId):
        self.logger.info("Admin/Owner is approving the job posting(ID: %s)", jobPostingId)
        self.db.approveJobPosting(jobPostingId)

    def get_job_postings(self):
        self.logger.info("Rendering all approved job_postings")

        return self.db.get_job_postings()

    def get_jobs_by_id(self, job_id):
        self.logger.info("Searching for job postings by id %s", job_id)

        return self.db.get_jobs_by_id(job_id)
