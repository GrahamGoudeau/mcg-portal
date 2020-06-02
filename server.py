from flask import Flask, send_from_directory
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

numPongs=0

@app.route('/ping')
def pong():
    global numPongs
    numPongs += 1
    return 'pong #' + str(numPongs) + '\n'

@app.route('/')
def serve_static():
    return send_from_directory('static', 'index.html', cache_timeout=-1)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
