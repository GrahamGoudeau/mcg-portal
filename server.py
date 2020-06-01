from flask import Flask, send_from_directory
app = Flask(__name__)

numPongs=0

@app.route('/ping')
def pong():
    global numPongs
    numPongs += 1
    return 'pong #' + str(numPongs) + '\n'

@app.route('/')
def serve_static():
    return send_from_directory('static', 'index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
