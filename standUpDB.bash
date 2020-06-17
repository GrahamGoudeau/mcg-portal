#!/bin/bash

exitCode=1
iterations=0

# wait until we can successfully accept connections
until [ $exitCode -eq 0 ] || [ $iterations -eq 20 ]; do
  sleep 3
  echo "Waiting for DB to come online, attempt $((iterations + 1)) of 20"

  # Just attempt to do a dummy `SELECT 1;` to see if it succeeds
  docker exec -it pg-docker psql -U postgres -h localhost -c 'select 1;' >/dev/null
  exitCode=$?

  iterations=$((iterations + 1))
done

# initialize test data that you want the db to be populated with when it comes up
docker exec -it pg-docker psql -U postgres -h localhost -c "
CREATE TYPE enrollment_status AS ENUM (
    'Current Student',
    'Alum'
);

CREATE TABLE account(
    id BIGSERIAL PRIMARY KEY,
    deactivated BOOLEAN NOT NULL DEFAULT FALSE,
    email TEXT NOT NULL,
    password_digest TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    full_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_initial TEXT NOT NULL,
    enrollment_status enrollment_status NULL, -- null if the user is neither a current student nor an alum
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX account_email ON account(LOWER(email));

-- password for this account is just 'password'
INSERT INTO account(email, password_digest, password_salt, full_name, first_name, last_initial, enrollment_status, is_admin) VALUES(
    'test@example.com',
    '\$2b\$12\$KuZta9JGWDgtd05EPbm8M.lYMex0jyOLhUSBbjEU3pm0N9SQaJGUG',
    '\$2b\$12\$KuZta9JGWDgtd05EPbm8M.',
    'Test Account',
    'Test',
    'A',
    NULL,
    TRUE
);

CREATE TABLE resource(
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    provider_id BIGINT REFERENCES account(id),
    location TEXT NULL
);

CREATE TABLE connection_request(
    id BIGSERIAL PRIMARY KEY,

    -- has an admin resolved this request
    resolved BOOLEAN NOT NULL DEFAULT FALSE,

    -- the member DOING the requesting
    requester_id BIGINT REFERENCES account(id) NOT NULL,

    -- the member from whom something is being requestd
    requestee_id BIGINT REFERENCES account(id) NOT NULL,

    -- a brief message explaining the request (optional)
    requester_message TEXT NULL,

    resource_id BIGINT REFERENCES resource(id) NOT NULL
);

CREATE TABLE event(
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    organizer_id BIGINT REFERENCES account(id) NOT NULL,
    description TEXT NULL
);
"
