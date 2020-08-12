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
FROM golang:1.14.7-alpine3.12 AS server_build

WORKDIR /app

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
COPY go.mod go.sum /app/

RUN go mod download

COPY . /app/

RUN go build -o server main.go

ENTRYPOINT ["/app/server"]

# don't run as root
RUN adduser -D server
USER server

COPY --from=ui_build /ui/build /app/ui/
