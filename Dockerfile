# Frontend build
FROM node:10.21.0-alpine AS ui_build

WORKDIR /ui

COPY ui/yarn.lock ui/package.json ./
RUN yarn install && yarn global add serve

ARG REACT_APP_HOSTNAME
ENV REACT_APP_HOSTNAME $REACT_APP_HOSTNAME

COPY ui/ /ui/

RUN yarn run build

# Backend build
FROM python:3.6.10-alpine3.11 AS server_build

WORKDIR /app

RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev libffi-dev && pip install psycopg2-binary==2.8.4

# copy over requirements and install those first to make docker layer cache hits more likely
COPY requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

# don't run as root
RUN adduser -D flask-example
USER flask-example

ARG PORT
ENV PORT $PORT

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

ARG JWT_KEY
ENV JWT_KEY $JWT_KEY

ARG JWT_BLACKLIST_TIMEOUT_SECONDS
ENV JWT_BLACKLIST_TIMEOUT_SECONDS $JWT_BLACKLIST_TIMEOUT_SECONDS

ARG ALLOW_HTTP
ENV ALLOW_HTTP $ALLOW_HTTP

# copy source code in
COPY . /app

ENTRYPOINT ["python", "/app/server.py"]

COPY --from=ui_build /ui/build /app/ui/
