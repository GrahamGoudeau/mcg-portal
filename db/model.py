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

class Event:
    def __init__(self, id, organizerId, name, description):
        self.id = id
        self.organizerId = organizerId
        self.name = name
        self.description = description
        
