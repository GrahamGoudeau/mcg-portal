class Account:
    def __init__(self, id, enrollmentStatus, isAdmin):
        self.id = id
        self.enrollmentStatus = enrollmentStatus
        self.isAdmin = isAdmin

class Resource:
    def __init__(self, id, providerId, name, location):
        self.id = id
        self.providerId = providerId
        self.name = name
        self.location = location
