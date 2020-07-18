class EventHandler:
    def __init__(self, db, logger):
        self.db = db
        self.logger = logger

    def post_event(self, userId, eventName, description, date, time):
        self.logger.info("User %s is creating event %s \nDescription: %s", userId, eventName, description, date, time)
        self.db.create_event(userId, eventName, description, date, time)

    def get_events_by_user(self, user_id):
        self.logger.info("Searching for events offered by user %s", user_id)

        return self.db.get_events(user_id)

    def get_all_events(self):
        self.logger.info("Rendering all events")

        return self.db.get_all_events()
