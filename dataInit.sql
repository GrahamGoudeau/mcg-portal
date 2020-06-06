BEGIN;

CREATE TYPE enrollment_status AS ENUM (
    'current_student',
    'alum'
);

CREATE TABLE account(
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    password_digest TEXT NOT NULL,
    full_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_initial TEXT NOT NULL,
    enrollment_status enrollment_status NULL, -- null if the user is neither a current student nor an alum
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX account_email ON account(LOWER(email));

ROLLBACK;
