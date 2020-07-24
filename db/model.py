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
    def __init__(self, event_id, name, organizer_id, description, date, time):
        self.id = event_id
        self.organizerId = organizer_id
        self.name = name
        self.description = description
        self.date = str(date)
        self.time = str(time)


class JobPostings:
    def __init__(self, job_id, post_id, title, post_time, description, location):
        self.id = job_id
        self.post_id = post_id
        self.title = title
        self.post_time = post_time
        self.description = description
        self.location = location

class ConnectionRequest:
    def __init__(self, id, resolved, requesterName, requesterEmail, requesteeName, requesteeEmail, message):
        self.id = id
        self.resolved = resolved
        self.requesterName = requesterName
        self.requesterEmail = requesterEmail
        self.requesteeName = requesteeName
        self.message = message
        self.requesteeEmail = requesteeEmail

class Name:
    def __init__(self, firstName, lastName):
        self.firstName = firstName
        self.lastName = lastName

    def toDict(self):
        return {
            'firstName': self.firstName,
            'lastName': self.lastName,
        }
