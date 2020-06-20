import psycopg2
from db.model import Account, Resource, Event

class PortalDb:
    def __init__(self, logger, password, url, name, user):
        self.logger = logger
        self.connectionString = 'dbname=' + name + ' user=' + user + ' host=' + url + ' password=' + password

    def getSaltForUser(self, email):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("SELECT password_salt FROM account WHERE email = %s AND NOT deactivated", (email,))
            result = cur.fetchone()
            if result is None:
                return None

            return result[0]

    def isAccountDeactivated(self, accountId):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("SELECT deactivated FROM account WHERE id = %s", (accountId,))
            return cur.fetchone()[0]

    def getAccountByEmailAndPassword(self, email, passwordHash):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("SELECT id, enrollment_status, is_admin FROM account WHERE email=%s AND password_digest=%s AND NOT deactivated",
                        (email, passwordHash))
            result = cur.fetchone()

            if result is None:
                return None

            return Account(result[0], result[1], result[2])

    def createAccount(self, email, passwordHash, passwordSalt, fullName, firstName, lastInitial, enrollmentStatus):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            try:
                cur.execute("INSERT INTO account(email, password_digest, password_salt, full_name, first_name, last_initial, enrollment_status) "
                            "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                            (email, passwordHash, passwordSalt, fullName, firstName, lastInitial, enrollmentStatus))
            except psycopg2.Error as e:
                if e.pgcode == "23505":
                    raise ValueError("Account already exists")
                raise e

    def createResource(self, userId, resourceName, location):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("INSERT INTO resource(id, name, provider_id, location)"
                        "VALUES (DEFAULT, %s, %s, %s)", (resourceName, userId, location))

    def deleteResource(self, resourceId):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("DELETE FROM resource WHERE id = %s", (resourceId,))

    def listResource(self, userId):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("SELECT id, provider_id, name, location FROM resource WHERE provider_id = %s", (userId,))

            return [Resource(row[0], row[1], row[2], row[3]) for row in cur]

    def createEvent(self, userId, eventName, description):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("INSERT INTO event(id, name, organizer_id, description)"
                        "VALUES (DEFAULT, %s, %s, %s)", (eventName, userId, description))

    def createRequest(self, userID, requesteeID, message):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("INSERT INTO connection_request(id, resolved, requester_id, requestee_id, requester_message)"
                        "VALUES (DEFAULT, false, %s, %s, %s)", (userID, requesteeID, message))

    def create_job(self, post_id, title, post_time, description, location):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("INSERT INTO job_posting(post_id, title, post_time, description, location) "
                        "VALUES(%s, %s, %s, %s, %s)", (post_id, title, post_time, description, location))

    def approveJobPosting(self, jobPostingId):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("UPDATE job_posting SET pending = FALSE WHERE id = %s", (jobPostingId,))
