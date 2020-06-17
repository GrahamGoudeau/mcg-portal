class EventHandler:
    def __init__(self, db, logger):
        self.db = db
        self.logger = logger

    def postEvent(self, userId, eventName, description):
        self.logger.info("User %s is creating event %s \nDescription: %s", userId, eventName, description)
        self.db.createEvent(userId, eventName, description)
