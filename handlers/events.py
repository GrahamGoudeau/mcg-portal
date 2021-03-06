class EventHandler:
    def __init__(self, db, logger):
        self.db = db
        self.logger = logger

    def post_event(self, userId, eventName, description, date, time):
        self.logger.info("User %s is creating event %s \nDescription: %s", userId, eventName, description, date, time)
        self.db.create_event(userId, eventName, description, date, time)

    def get_events_by_user(self, user_id):
        self.logger.info("Searching for events offered by user %s", user_id)

        return self.db.get_events_for_user(user_id)

    def get_approved_events(self):
        self.logger.info("Rendering all events")

        return self.db.get_approved_events()

    def get_event_by_id(self, event_id):
        self.logger.info("Searching for event by id %s", event_id)

        return self.db.get_event(event_id)
