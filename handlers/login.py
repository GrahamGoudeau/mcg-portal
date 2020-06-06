import datetime

class LoginHandler:
    def __init__(self, db, logger, accessTokenCreator):
        self.db = db
        self.logger = logger
        self.accessTokenCreator = accessTokenCreator

    def generateUserToken(self, email, password):
        self.logger.info("Generating token for %s", email)

        account = self.db.getAccountByEmailAndPassword(email, password)
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
