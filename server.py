from flask import Flask, send_from_directory
import psycopg2

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

numPongs=0

@app.route('/ping')
def pong():
    global numPongs
    numPongs += 1

    # demonstrate DB connectivity, this doesn't do anything interesting beyond that
    with psycopg2.connect('dbname=postgres user=postgres host=host.docker.internal password=docker') as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM test")

    items = cur.fetchall()

    # return pong #n
    return 'pong #' + str(numPongs) + '\n'

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html', cache_timeout=-1)

@app.route('/static/<path>')
def serve_static(path):
    return send_from_directory('static', path, cache_timeout=-1)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
