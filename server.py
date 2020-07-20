from flask import Flask, send_from_directory, jsonify, Response, request
from dotenv import load_dotenv
from flask_json_schema import JsonSchema, JsonValidationError
import os
from logging.config import dictConfig
from functools import wraps
from handlers import accounts, resources, connectionRequests, events, jobs
from db import db
import jsonpickle
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity, get_jwt_claims
)
from flask_cors import CORS
import re
from flask_gzip import Gzip

dictConfig({
    'version': 1,
    'root': {
        'level': 'INFO',
    }
})

load_dotenv()


def getEnvVarOrDie(envVarName):
    value = os.getenv(envVarName)
    if not value:
        raise "Must set the " + envVarName + " environment variable (have you created a .env file during local development?)"
    return value


app = Flask(__name__, static_folder=None)
CORS(app)
gzip = Gzip(app, minimum_size=10)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['JWT_SECRET_KEY'] = getEnvVarOrDie("JWT_KEY")
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
jwt = JWTManager(app)
schema = JsonSchema(app)

logger = app.logger

port = getEnvVarOrDie("PORT")
logger.info("Using port: %s", port)

dbUrl = getEnvVarOrDie("DATABASE_URL")
dbHostnameMatch = re.compile("^.*@([a-zA-Z0-9.:-]+)/.*$").search(dbUrl)
logger.info("Connecting to db at: %s", dbHostnameMatch.group(1))
db = db.PortalDb(logger, dbUrl)

accountHandler = accounts.AccountHandler(db, logger, create_access_token)
resourcesHandler = resources.ResourcesHandler(db, logger)
eventHandler = events.EventHandler(db, logger)
connectionRequests = connectionRequests.ConnectionRequestsHandler(db, logger)
jobHandler = jobs.JobHandler(db, logger)


def jsonMessageWithCode(message, code=200):
    return jsonify({
        'message': message
    }), code


def getRequesterIdInt():
    jwtIdentity = get_jwt_identity()
    if jwtIdentity is None:
        return None

    return int(jwtIdentity)


def isRequesterAdmin():
    return get_jwt_claims().get('is_admin', False)


# check if the user account has been deactivated, and respond with a 401 if it has
@jwt.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token):
    return accountHandler.isAccountDeactivated(decrypted_token['identity'])


# use when an endpoint has a <int:userId> field in it, to ensure that the
# user encoded in the JWT matches the userId field in the path
def ensureOwnerOrAdmin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        intendedUserId = request.view_args.get('userId', None)
        requesterId = getRequesterIdInt()

        # if we're an admin, or if BOTH the requester ID and intended ID are provided and they are equal, run the request handler
        if isRequesterAdmin() or (requesterId is not None and intendedUserId is not None and requesterId == intendedUserId):
            return f(*args, **kwargs)

        return jsonMessageWithCode('The user initiating this request does not own this resource', 401)

    return decorated_function

loginSchema = {
    'required': ['email', 'password'],
    'properties': {
        'email': {'type': 'string'},
        'password': {'type': 'string'},
    },
    'additionalProperties': False,
}

@app.route('/api/login', methods=['POST'])
@schema.validate(loginSchema)
def login():
    email = request.json.get('email')
    logger.info('User with email %s logging in', email)
    token = accountHandler.generateJwtToken(email, request.json.get('password'))

    if token is None:
        return Response(status=401)

    return jsonify({
        'jwt': token,
    })


@app.errorhandler(JsonValidationError)
def validation_error(e):
    return jsonify({'error': e.message, 'errors': [validation_error.message for validation_error in e.errors]}), 400


createAccountSchema = {
    'required': ['email', 'password', 'firstName', 'lastName'],
    'properties': {
        'email': {'type': 'string'},
        'firstName': {'type': 'string'},
        'lastName': {'type': 'string'},
        'password': {'type': 'string'},
        'enrollmentStatus': {'type': ['string','null']},
    },
    'additionalProperties': False,
}


@app.route('/api/accounts', methods=['POST'])
@schema.validate(createAccountSchema)
def createUser():
    try:
        accountHandler.createAccount(request.json.get('email'), request.json.get('firstName'), request.json.get('lastName'),
                                     request.json.get('password'), request.json.get('enrollmentStatus'))
    except ValueError as e:
        return jsonMessageWithCode(str(e), 409)

    token = accountHandler.generateJwtToken(request.json.get('email'), request.json.get('password'))
    if token is None:
        message = "Token was unexpectedly None during user create"
        logger.error(message)
        return jsonMessageWithCode(message, 500)

    return jsonify({
        'jwt': token,
    })

@app.route('/api/account')
@jwt_required
def getAccountInfo():
    userId = getRequesterIdInt()
    accountInfo = accountHandler.getInfo(userId)

    return jsonify(jsonpickle.decode(jsonpickle.encode(accountInfo)))

createResourceSchema = {
    'required': ['name'],
    'properties': {
        'name': {'type': 'string'},
        'location': {'type': 'string'},
    },
    'additionalProperties': False,
}


@app.route('/api/accounts/<int:userId>/resources', methods=['POST'])
@jwt_required
@ensureOwnerOrAdmin
@schema.validate(createResourceSchema)
def createResource(userId):
    resourcesHandler.offerResource(userId, request.json.get('name'), request.json.get('location'))
    return jsonMessageWithCode('successfully created')


@app.route('/api/accounts/<int:userId>/resources', methods=['GET'])
def listResources(userId):
    resourcesForUser = resourcesHandler.getResourcesOfferedByUser(userId)
    # print(resourcesForUser.__dict__)
    # convert to an array of dicts, which are json serializable
    # serialized = [{
    #     'id': resource.id,
    #     'providerId': resource.providerId,
    #     'name': resource.name,
    #     'location': resource.location,
    # } for resource in resourcesForUser]

    return jsonify([resource.__dict__ for resource in resourcesForUser])
  

@app.route('/api/accounts')
def render_members_resources():
    member_dict = resourcesHandler.get_members_resources()
    arr = list(member_dict.values())

    return jsonify(arr)


@app.route('/api/accounts/<int:userId>/resources/<int:resourceId>', methods=['DELETE'])
@jwt_required
@ensureOwnerOrAdmin
def deleteResourceFromUser(userId, resourceId):
    resourcesHandler.deleteResource(resourceId)
    return jsonMessageWithCode('success')


@app.route('/img/<path>')
def serve_static(path):
    app.logger.info("Serving static content at /img/ and path: " + path)
    return send_from_directory('ui/public', path, cache_timeout=-1)


@app.route('/static/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('/app/ui/static/css', filename, cache_timeout=-1, mimetype="text/css")


@app.route('/static/js/<path:filename>')
def serve_js(filename):
    app.logger.info("Serving js")
    return send_from_directory('/app/ui/static/js', filename, cache_timeout=-1, mimetype="text/javascript")


@app.route('/static/media/<path:filename>')
def serve_media(filename):
    return send_from_directory('/app/ui/static/media', filename, cache_timeout=-1)


# new
connectionRequestsSchema = {
    'required': ['requesteeID'],
    'properties': {
        'requesteeID': {'type': 'number'},
        'message': {'type': 'string'},
    },
    'additionalProperties': False,
}


@app.route('/api/connection-requests', methods=['GET'])
@jwt_required
@ensureOwnerOrAdmin
def getAllConnectionRequests():
    allRequests = connectionRequests.getAllRequests()
    return jsonify([{
        'id': r.id,
        'resolved': r.resolved,
        'requesterName': r.requesterName.toDict(),
        'requesteeName': r.requesteeName.toDict(),
        'message': r.message,
    } for r in allRequests])

@app.route('/api/connection-requests', methods=['POST'])
@jwt_required
@schema.validate(connectionRequestsSchema)
def createConnectionRequest():
    connectionRequests.makeRequest(getRequesterIdInt(), request.json.get('requesteeID'), request.json.get('message'))
    return jsonMessageWithCode('connection request created successfully')


updateConnectionRequestSchema = {
    'properties': {
        'resolved': {'type': 'boolean'},
    },
    'additionalProperties': False,
}

@app.route('/api/connection-requests/<int:connectionRequestId>', methods=['PATCH'])
@jwt_required
@ensureOwnerOrAdmin
@schema.validate(updateConnectionRequestSchema)
def editConnectionRequest(connectionRequestId):
    isResolved = request.json.get('resolved')
    if isResolved:
        connectionRequests.markResolved(connectionRequestId)

    return Response(status=200)

createEventSchema = {
    'required': ['name'],
    'properties': {
        'name': {'type': 'string'},
        'description': {'type': 'string'},
    },
    'additionalProperties': False,
}


@app.route('/api/events', methods=['POST'])
@jwt_required
@schema.validate(createEventSchema)
def createEvent():
    userId = getRequesterIdInt()
    eventHandler.postEvent(userId, request.json.get('name'), request.json.get('description'))
    return jsonMessageWithCode('successfully created')


@app.route('/api/accounts/<int:user_id>/events', methods=['GET'])
def list_events_by_user(user_id):
    events_by_user = eventHandler.get_events_by_user(user_id)

    return jsonify([event.__dict__ for event in events_by_user])


createJobSchema = {
    'required': ['title', 'post_time', 'description'],
    'properties': {
        'title': {'type': 'string'},
        'post_time': {'type': 'string'},
        'description': {'type': 'string'},
        'location': {'type': 'string'}
    },
    'additionalProperties': False,
}


@app.route('/api/job-postings', methods=['POST'])
@jwt_required
@schema.validate(createJobSchema)
def create_job():
    post_id = getRequesterIdInt()
    jobHandler.post_job(post_id, request.json.get('title'), request.json.get('post_time'),
                        request.json.get('description'), request.json.get('location'))
    return jsonMessageWithCode('successfully applied for new job posting.')


@app.route('/api/job-postings/<int:jobPostingId>/approved', methods=['POST'])
@jwt_required
@ensureOwnerOrAdmin
def approveJobPosting(userId, jobPostingId):
    jobHandler.approveJobPosting(userId, jobPostingId)
    return jsonMessageWithCode('successfully approved the job posting.')


@app.route('/api/all_job_postings')
def render_job_postings():
    job_dict = jobHandler.get_job_postings()

    return jsonify(list(job_dict.values()))


@app.route('/api/accounts/<int:user_id>/jobs', methods=['GET'])
def list_jobs_by_user(user_id):
    jobs_by_user = jobHandler.get_jobs_by_user(user_id)

    return jsonify([job.__dict__ for job in jobs_by_user])


@app.route('/api/<path:path>')
def unknownApiRoute(path):
    return jsonMessageWithCode("unknown API endpoint: " + path, 404)

# needs to be the last route handler, because /<string:path> will match everything
@app.route('/', defaults={"path": ""})
@app.route('/<path:path>')
def serve_index(path):
    return send_from_directory('ui', 'index.html', cache_timeout=-1)


@app.after_request
def after_request(response):
    response = gzip.after_request(response)
    return response

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port)
