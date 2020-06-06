import psycopg2
from db.model import Account

class PortalDb:
    def __init__(self, password, url, name, user):
        self.connectionString = 'dbname=' + name + ' user=' + user + ' host=' + url + ' password=' + password

    def getSaltForUser(self, email):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("SELECT password_salt FROM account WHERE email = %s", (email,))
            result = cur.fetchone()
            if result is None:
                return None

            return result[0]

    def getAccountByEmailAndPassword(self, email, passwordHash):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("SELECT id, enrollment_status, is_admin FROM account WHERE email=%s AND password_digest=%s",
                        (email, passwordHash))
            result = cur.fetchone()

            if result is None:
                return None

            return Account(result[0], result[1], result[2])

    def createAccount(self, email, passwordHash, passwordSalt, fullName, firstName, lastInitial, enrollmentStatus):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("INSERT INTO account(email, password_digest, password_salt, full_name, first_name, last_initial, enrollment_status) "
                        "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                        (email, passwordHash, passwordSalt, fullName, firstName, lastInitial, enrollmentStatus))
