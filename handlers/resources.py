class ResourcesHandler:
    def __init__(self, db, logger):
        self.db = db
        self.logger = logger

    def offerResource(self, userId, resourceName, location):
        self.logger.info("User %s is creating resouce %s at location %s", userId, resourceName, location)
        self.db.createResource(userId, resourceName, location)

    def getResourcesOfferedByUser(self, userId):
        self.logger.info("Searching for resources offered by user %s", userId)
        return self.db.listResource(userId)

    def deleteResource(self, resourceId):
        self.logger.info("Deleting resource %s", resourceId)
        self.db.deleteResource(resourceId)

    def get_members_resources(self):
        self.logger.info("Rendering all members with resources")
        return self.db.get_member_with_resources()
