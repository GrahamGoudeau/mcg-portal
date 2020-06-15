class ConnectionRequestsHandler:
    def __init__(self, db, logger):
        self.db = db
        self.logger = logger

    def makeRequest(self, userID, requesteeID, message):
        self.logger.info('User %s is creating request to connect with %s', userID, requesteeID)
        self.db.createRequest(userID, requesteeID, message)
            #here is where you call it
