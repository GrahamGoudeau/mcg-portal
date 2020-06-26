class JobHandler:
    def __init__(self, db, logger):
        self.db = db
        self.logger = logger

    def post_job(self, post_id, title, post_time, description, location):
        self.logger.info("User %s wants to creates a job posting: %s on %s\nDescription: %s \nLocation: %s", post_id,
                         title, post_time, description, location)
        self.db.create_job(post_id, title, post_time, description, location)

    def approveJobPosting(self, approverId, jobPostingId):
        self.logger.info("Admin/Owner %s is approving the job posting(ID: %s)", approverId, jobPostingId)
        self.db.approveJobPosting(jobPostingId)
