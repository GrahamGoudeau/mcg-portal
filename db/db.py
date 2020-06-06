import psycopg2
from db.model import Account

class PortalDb:
    def __init__(self, password, url, name, user):
        self.connectionString = 'dbname=' + name + ' user=' + user + ' host=' + url + ' password=' + password

    def getAccountByEmailAndPassword(self, email, password):
        with psycopg2.connect(self.connectionString) as con:
            cur = con.cursor()
            cur.execute("SELECT id, enrollment_status, is_admin FROM account WHERE email=%s AND password_digest=MD5(%s)",
                        (email, password))
            result = cur.fetchone()

            if result is None:
                return None

            return Account(result[0], result[1], result[2])
