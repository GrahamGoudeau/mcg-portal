import bcrypt
import datetime

class AccountHandler:
    def __init__(self, db, logger, accessTokenCreator):
        self.db = db
        self.logger = logger
        self.accessTokenCreator = accessTokenCreator

    # throws a ValueError if the account already exists
    def createAccount(self, email, firstName, lastName, password, enrollmentStatus):
        lastInitial = lastName[0]
        newPasswordSalt = bcrypt.gensalt()
        hashedPassword = bcrypt.hashpw(password.encode('utf8'), newPasswordSalt).decode('utf8')

        self.db.createAccount(email, hashedPassword, newPasswordSalt.decode('utf8'), firstName, lastName, lastInitial, enrollmentStatus)

    def isAccountDeactivated(self, accountId):
        return self.db.isAccountDeactivated(accountId)

    # returns None if the user doesn't exist or if the password doesn't match what we have stored
    def generateJwtToken(self, email, password):
        self.logger.info("Generating token for %s", email)

        passwordSalt = self.db.getSaltForUser(email)
        if passwordSalt is None:
            return None

        self.logger.info("using salt: %s", passwordSalt)
        passwordHash = bcrypt.hashpw(password.encode('utf8'), passwordSalt.encode('utf8')).decode('utf8')

        account = self.db.getAccountByEmailAndPassword(email, passwordHash)
        if account is None:
            self.logger.info("Failed to find account for %s", email)
            return None

        # logins are good for 7 days
        expires = datetime.timedelta(days=7)

        token = self.accessTokenCreator(identity=account.id, expires_delta=expires, user_claims={
            'is_admin': account.isAdmin,
        })

        self.logger.info("Generated token %s", token)
        return token

    def get_info(self, user_id):
        self.logger.info("User %s is getting account info", user_id)
        return self.db.get_account_info(user_id)
