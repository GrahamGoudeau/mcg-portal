class ConnectionRequestsHandler:
    def __init__(self, db, logger):
        self.db = db
        self.logger = logger

    def make_request(self, userID, requesteeID, message):
        self.logger.info('User %s is creating request to connect with %s', userID, requesteeID)
        self.db.create_request(userID, requesteeID, message)

    def mark_resolved(self, connectionRequestId):
        self.logger.info('Admin is resolving connection request')
        self.db.resolveRequest(connectionRequestId)
