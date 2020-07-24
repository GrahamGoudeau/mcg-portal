from expiringdict import ExpiringDict


class TokenBlacklist:
    def __init__(self, logger, accountHandler, cacheTtlSeconds):
        self.accountHandler = accountHandler
        self.logger = logger
        self.cache = ExpiringDict(max_len=1000, max_age_seconds=cacheTtlSeconds)

    def isBlacklisted(self, accountId):
        answer = self.cache.get(accountId, default=None)
        if answer is None:
            self.logger.info("Blacklist cache miss for account %s, looking it up", accountId)
            answer = self.accountHandler.isAccountDeactivated(accountId)
            self.logger.info("Now caching blacklist answer %s for account %s", answer, accountId)
            self.cache[accountId] = answer
        else:
            self.logger.info("Blacklist cache hit: deactivated is %s for account %s", answer, accountId)
        return answer
