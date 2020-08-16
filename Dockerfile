ARG NODE_IMAGE=node:10.21.0-alpine
ARG GOLANG_IMAGE=golang:1.14.7-alpine3.12

# Frontend build
FROM $NODE_IMAGE AS ui_build

WORKDIR /ui

COPY ui/yarn.lock ui/package.json ./
RUN yarn install && yarn global add serve

ARG REACT_APP_HOSTNAME
ENV REACT_APP_HOSTNAME $REACT_APP_HOSTNAME

COPY ui/ /ui/

RUN yarn run build

# Backend build
FROM $GOLANG_IMAGE AS server_build

WORKDIR /app

# copy source code in
COPY go.mod go.sum /app/
RUN go mod download

COPY . /app/
RUN go build -o server main.go

FROM $GOLANG_IMAGE AS server_run

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

ARG MAILGUN_DOMAIN
ENV MAILGUN_DOMAIN $MAILGUN_DOMAIN

ARG MAILGUN_API_KEY
ENV MAILGUN_API_KEY $MAILGUN_API_KEY

COPY --from=ui_build /ui/build /app/ui/
COPY --from=server_build /app/server /app/server

ENTRYPOINT ["/app/server"]

# don't run as root
RUN adduser -D server
USER server
