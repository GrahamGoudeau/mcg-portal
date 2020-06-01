FROM python:3.6.10-alpine3.11

RUN adduser -D flask-example
USER flask-example

WORKDIR /app

COPY requirements.txt /app/requirements.txt

RUN pip install -r /app/requirements.txt

COPY . /app

ENTRYPOINT ["python", "/app/server.py"]
