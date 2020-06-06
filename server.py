from flask import Flask, send_from_directory, jsonify, Response, request
from dotenv import load_dotenv
from flask_json_schema import JsonSchema, JsonValidationError
import os
from logging.config import dictConfig
from handlers.accounts import AccountHandler
from db import db
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity, get_jwt_claims
)

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


dbPassword = getEnvVarOrDie("DB_PASS")
dbUrl = getEnvVarOrDie("DB_URL")
dbName = getEnvVarOrDie("DB_NAME")
dbUser = getEnvVarOrDie("DB_USER")

app = Flask(__name__, static_folder=None)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['JWT_SECRET_KEY'] = getEnvVarOrDie("JWT_KEY")
jwt = JWTManager(app)
schema = JsonSchema(app)

logger = app.logger

db = db.PortalDb(dbPassword, dbUrl, dbName, dbUser)
accountHandler = AccountHandler(db, logger, create_access_token)

@app.route('/api/login', methods=['POST'])
def login():
    email = request.json.get('email')
    logger.info('User with email %s logging in', email)
    token = accountHandler.generateUserToken(email, request.json.get('password'))

    if token is None:
        return Response(status=401)

    return jsonify({
        'jwt': token,
    })


@app.errorhandler(JsonValidationError)
def validation_error(e):
    return jsonify({'error': e.message, 'errors': [validation_error.message for validation_error in e.errors]})


createAccountSchema = {
    'required': ['email', 'password', 'fullName'],
    'properties': {
        'email': {'type': 'string'},
        'fullName': {'type': 'string'},
        'password': {'type': 'string'},
        'enrollmentStatus': {'type': 'string'},
    },
    'additionalProperties': False,
}

@app.route('/api/accounts', methods=['POST'])
@schema.validate(createAccountSchema)
def createUser():
    accountHandler.createAccount(request.json.get('email'), request.json.get('fullName'), request.json.get('password'), request.json.get('enrollmentStatus'))
    return 'success'


@app.route('/protected', methods=['GET'])
@jwt_required
def protected():
    claims = get_jwt_claims()
    logger.info(claims)
    logger.info(get_jwt_identity())
    return jsonify(claims), 200


@app.route('/img/<path>')
def serve_static(path):
    app.logger.info("Serving static content at /img/ and path: " + path)
    return send_from_directory('ui/public', path, cache_timeout=-1)


@app.route('/static/static/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('/app/ui/static/css', filename, cache_timeout=-1)


@app.route('/static/static/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('/app/ui/static/js', filename, cache_timeout=-1)


@app.route('/static/static/media/<path:filename>')
def serve_media(filename):
    return send_from_directory('/app/ui/static/media', filename, cache_timeout=-1)


@app.route('/', defaults={"path": ""})
@app.route('/<string:path>')
def serve_index(path):
    return send_from_directory('ui', 'index.html', cache_timeout=-1)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
