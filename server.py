from flask import Flask, send_from_directory
import psycopg2
from dotenv import load_dotenv
import os
import sys

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

numPongs=0

@app.route('/ping')
def pong():
    global numPongs
    numPongs += 1

    # demonstrate DB connectivity, this doesn't do anything interesting beyond that
    with psycopg2.connect('dbname=' + dbName + ' user=' + dbUser + ' host=' + dbUrl + ' password=' + dbPassword) as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM my_test_table;")

    items = cur.fetchall()

    # return pong #n
    return 'pong #' + str(numPongs) + '\n'

@app.route('/')
def serve_index():
    return send_from_directory('ui', 'index.html', cache_timeout=-1)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
