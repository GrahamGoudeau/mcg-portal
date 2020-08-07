import psycopg2
from db.model import Account, Resource, Event, JobPostings, ConnectionRequest, Name
from collections import defaultdict


class PortalDb:
    def __init__(self, logger, connectionString):
        self.logger = logger
        self.connectionString = connectionString

    @classmethod
    def fromCredentials(cls, logger, password, url, name, user):
        connectionString = 'dbname=' + name + ' user=' + user + ' host=' + url + ' password=' + password
        return cls(logger, connectionString)

    def getSaltForUser(self, email):
        with psycopg2.connect(self.connectionString) as con, con.cursor() as cur:
            cur.execute("SELECT password_salt FROM account WHERE email = %s AND NOT deactivated", (email,))
            result = cur.fetchone()
            if result is None:
                return None

            return result[0]

    def isAccountDeactivated(self, accountId):
        with psycopg2.connect(self.connectionString) as con, con.cursor() as cur:
            cur.execute("SELECT deactivated FROM account WHERE id = %s", (accountId,))
            row = cur.fetchone()
            if row is None:
                self.logger.info("Account id %s does not exist anymore", accountId)
                return True

            return row[0]

    def getAccountByEmailAndPassword(self, email, passwordHash):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute(
                "SELECT id, enrollment_type, is_admin FROM account WHERE email=%s AND password_digest=%s AND NOT deactivated",
                (email, passwordHash))
            result = cur.fetchone()

            if result is None:
                self.logger.info("Account with email %s was not found", email)
                return None

            return Account(result[0], result[1], result[2])

    def createAccount(self, email, passwordHash, passwordSalt, firstName, lastName, lastInitial, enrollmentType):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            try:
                cur.execute(
                    "INSERT INTO account(email, password_digest, password_salt, first_name, last_name, last_initial, enrollment_type) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (email, passwordHash, passwordSalt, firstName, lastName, lastInitial, enrollmentType))
            except psycopg2.Error as e:
                if e.pgcode == "23505":
                    self.logger.info("Uniqueness violation on email %s", email)
                    raise ValueError("Account already exists")
                raise e

    def createResource(self, userId, resourceName, location):
        with psycopg2.connect(self.connectionString) as con, con.cursor() as cur:
            cur.execute("INSERT INTO resource(id, name, provider_id, location)"
                        "VALUES (DEFAULT, %s, %s, %s)", (resourceName, userId, location))

    def getMembersWithEnrollmentStatAndResources(self):
        with psycopg2.connect(self.connectionString) as con, con.cursor() as cur:
            cur.execute("SELECT account.id AS account_id, first_name, last_initial, enrollment_type, resource.name, resource.id AS resource_id FROM account JOIN resource "
                        "ON account.id = provider_id")
            rows = cur.fetchall()
            d = defaultdict(dict)

            for row in rows:
                cur_id = row[0]

                if cur_id not in d:
                    d[cur_id]["id"] = cur_id
                    d[cur_id]["firstName"] = row[1]
                    d[cur_id]["lastInitial"] = row[2]
                    d[cur_id]["enrollmentType"] = row[3]
                    d[cur_id]["resources"] = [{
                        'name': row[4],
                        'id': row[5],
                    }]

                else:
                    d[cur_id]["resources"].append({
                        'name': row[4],
                        'id': row[5],
                    })

        return d

    def deleteResource(self, resourceId):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("DELETE FROM resource WHERE id = %s", (resourceId,))

    def listResource(self, userId):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("SELECT id, provider_id, name, location FROM resource WHERE provider_id = %s", (userId,))

            return [Resource(row[0], row[1], row[2], row[3]) for row in cur]

    def create_event(self, user_id, name, description, date, time):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("INSERT INTO event(id, name, organizer_id, description, event_date, event_time)"
                        "VALUES (DEFAULT, %s, %s, %s, %s, %s)", (name, user_id, description, date, time))

    def get_events(self, user_id):
        with psycopg2.connect(self.connectionString) as con, con.cursor() as cur:
            cur.execute("SELECT * FROM event WHERE organizer_id = %s ORDER BY (event_date, event_time) DESC",
                        (user_id, ))

            return [Event(*row) for row in cur]

    def get_event(self, event_id):
        with psycopg2.connect(self.connectionString) as con, con.cursor() as cur:
            cur.execute("SELECT * FROM event WHERE id = %s", (event_id, ))
            row = next(cur)

        return Event(*row)

    def get_all_events(self):
        with psycopg2.connect(self.connectionString) as con, con.cursor() as cur:
            cur.execute("SELECT * FROM event ORDER BY (event_date, event_time) DESC ")

            return [Event(*row) for row in cur]

    def create_request(self, userID, requesteeID, message):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("INSERT INTO connection_request(id, resolved, requester_id, requestee_id, requester_message)"
                        "VALUES (DEFAULT, false, %s, %s, %s)", (userID, requesteeID, message))

    def resolveRequest(self, connectionRequestId):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("UPDATE connection_request SET resolved = TRUE WHERE id = %s", (connectionRequestId,))

    def create_job(self, post_id, title, post_time, description, location):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("INSERT INTO job_posting(post_id, title, post_time, description, location) "
                        "VALUES(%s, %s, %s, %s, %s)", (post_id, title, post_time, description, location))

    def approveJobPosting(self, jobPostingId):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("UPDATE job_posting SET pending = FALSE WHERE id = %s", (jobPostingId,))

    def get_jobs(self, job_id):
        with psycopg2.connect(self.connectionString) as con, con.cursor() as cur:
            cur.execute("SELECT j.id, j.title, j.post_time, j.description, j.location, j.pending, a.first_name, "
                        "a.last_initial, a.enrollment_type FROM job_posting j JOIN account a ON a.id = j.post_id "
                        "WHERE j.id = %s", (job_id, ))

            row = next(cur)

            return {
                'id': row[0],
                'title': row[1],
                'post_time': row[2].strftime('%Y-%m-%d'),
                'description': row[3],
                'location': row[4],
                'pending': row[5],
                'first_name': row[6],
                'last_initial': row[7],
                'enrollment': row[8],
            }

    def get_job_postings(self):
        with psycopg2.connect(self.connectionString) as con, con.cursor() as cur:
            cur.execute("SELECT id, title, post_time, description, location, pending FROM job_posting WHERE NOT pending")
            return [{
                'id': row[0],
                'title': row[1],
                'post_time': row[2].strftime('%Y-%m-%d'),
                'description': row[3],
                'location': row[4],
                'pending': row[5],
            } for row in cur.fetchall()]

    def getAllConnectionRequests(self):
        with psycopg2.connect(self.connectionString) as con, con.cursor() as cur:
            cur.execute("""SELECT
                r.id,
                r.resolved,
                r.requester_message,
                a1.first_name as requester_first_name,
                a1.last_name as requester_last_name,
                a1.email as requester_email,
                a2.first_name as requestee_first_name,
                a2.last_name as requestee_last_name,
                a2.email as requestee_email
                FROM connection_request r
                JOIN account a1 ON r.requester_id = a1.id
                JOIN account a2 ON r.requestee_id = a2.id;
            """)
            return [ConnectionRequest(
                row[0],
                row[1],
                Name(row[3], row[4]),
                row[5],
                Name(row[6], row[7]),
                row[8],
                row[2],
            ) for row in cur.fetchall()]


    def getAccountInfo(self, userId):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("SELECT first_name, last_name, email, enrollment_type, bio, role, current_school, current_company FROM account WHERE id = %s", (userId,))
            row = next(cur)

            serialized = {
                'firstName': row[0],
                'lastName': row[1],
                'email': row[2],
                'enrollmentType': row[3],
                'bio': row[4],
                'currentRole': row[5],
                'currentSchool': row[6],
                'currentCompany': row[7]
            }

            return serialized

    def getAccountDetails(self, userId):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("SELECT first_name, last_initial, bio, role, current_school, current_company, enrollment_type FROM account WHERE id = %s", (userId,))
            row = next(cur)

            serialized = {
                'firstName': row[0],
                'lastInitial': row[1],
                'bio': row[2],
                'currentRole': row[3],
                'currentSchool': row[4],
                'currentCompany': row[5],
                'enrollmentType': row[6],
            }

            return serialized

    def newAccountInfo(self, userId, bio, currentRole, currentSchool, currentCompany, firstName):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("UPDATE account SET bio = %s, role = %s, current_school = %s, current_company = %s, first_name = %s WHERE id = %s", (bio, currentRole, currentSchool, currentCompany, firstName, userId))
