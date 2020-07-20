class EventHandler:
    def __init__(self, db, logger):
        self.db = db
        self.logger = logger

    def postEvent(self, userId, eventName, description):
        self.logger.info("User %s is creating event %s \nDescription: %s", userId, eventName, description)
        self.db.createEvent(userId, eventName, description)

    def get_events_by_user(self, user_id):
        self.logger.info("Searching for events offered by user %s", user_id)

        return self.db.get_events(user_id)
