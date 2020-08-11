BEGIN;

DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS admin_account CASCADE;
DROP TABLE IF EXISTS admin_approval_request CASCADE;
DROP INDEX IF EXISTS idx_pending_approval_requests CASCADE;
DROP INDEX IF EXISTS idx_account_email CASCADE;
DROP TABLE IF EXISTS account_revisions CASCADE;
DROP INDEX IF EXISTS idx_original_account_id CASCADE;
DROP TABLE IF EXISTS resource CASCADE;
DROP TABLE IF EXISTS resource_revisions CASCADE;
DROP TABLE IF EXISTS connection_request CASCADE;
DROP TABLE IF EXISTS event CASCADE;
DROP TABLE IF EXISTS event_revision CASCADE;
DROP TABLE IF EXISTS job_posting CASCADE;
DROP TABLE IF EXISTS job_posting_revision CASCADE;
DROP TYPE IF EXISTS enrollment_type CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;

CREATE TYPE enrollment_type AS ENUM (
    'Current Student',
    'Alum',
    'Staff'
);

CREATE TYPE approval_status AS ENUM (
    'Not Reviewed',
    'Approved',
    'Rejected',
    'Not Applicable' -- e.g. the original resource was deleted before admin review
);

CREATE TABLE account(
    id BIGSERIAL PRIMARY KEY,
    deactivated BOOLEAN NOT NULL DEFAULT FALSE,
    email TEXT NOT NULL,
    password_digest TEXT NOT NULL,
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_initial TEXT NOT NULL,
    enrollment_type enrollment_type NULL, -- null if the user is neither a current student nor an alum
    bio TEXT NULL,
    role TEXT NULL,
    current_school TEXT NULL,
    current_company TEXT NULL
);

CREATE UNIQUE INDEX idx_account_email ON account(LOWER(email));

CREATE TABLE admin_account(
    account_id BIGINT PRIMARY KEY REFERENCES account(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_approval_request(
    id BIGSERIAL PRIMARY KEY,
    approval_status approval_status NOT NULL DEFAULT 'Not Reviewed',
    approved_by BIGINT REFERENCES admin_account(account_id) NULL,
    approved_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pending_approval_requests ON admin_approval_request(approval_status) WHERE approval_status = 'Not Reviewed';

CREATE TABLE account_revisions(
    id BIGSERIAL PRIMARY KEY,
    admin_approval_request_id BIGINT REFERENCES admin_approval_request(id) NOT NULL,
    original_account_id BIGINT REFERENCES account(id) NULL, -- null if this is a brand new account
    email TEXT NOT NULL,
    password_digest TEXT NOT NULL,
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    enrollment_type enrollment_type NULL,
    bio TEXT NULL,
    role TEXT NULL,
    current_school TEXT NULL,
    current_company TEXT NULL
);

CREATE INDEX idx_original_account_id ON account_revisions(original_account_id);

-- password for this account is just 'password'
INSERT INTO account(email, password_digest, first_name, last_name, last_initial, enrollment_type) VALUES(
    'test@example.com',
    '$2b$12$KuZta9JGWDgtd05EPbm8M.lYMex0jyOLhUSBbjEU3pm0N9SQaJGUG',
    'Test',
    'Account',
    'A',
    NULL
);

INSERT INTO account(email, password_digest, first_name, last_name, last_initial, enrollment_type) VALUES(
    'admin-for-unit-tests',
    '$2b$12$KuZta9JGWDgtd05EPbm8M.lYMex0jyOLhUSBbjEU3pm0N9SQaJGUG',
    'Test',
    'Account',
    'A',
    NULL
);

INSERT INTO account(email, password_digest, first_name, last_name, last_initial, enrollment_type) VALUES(
    'non-admin-for-unit-tests',
    '$2b$12$KuZta9JGWDgtd05EPbm8M.lYMex0jyOLhUSBbjEU3pm0N9SQaJGUG',
    'Test',
    'Account',
    'A',
    NULL
);

INSERT INTO admin_account(account_id) VALUES
    ((SELECT id FROM account WHERE email = 'test@example.com')),
    ((SELECT id FROM account WHERE email = 'admin-for-unit-tests'))
;

CREATE TABLE resource(
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    provider_id BIGINT REFERENCES account(id) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE resource_revisions(
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    admin_approval_request_id BIGINT REFERENCES admin_approval_request(id) NOT NULL,
    provider_id BIGINT REFERENCES account(id) NOT NULL
);

CREATE TABLE connection_request(
    id BIGSERIAL PRIMARY KEY,

    -- has an admin resolved this request
    admin_approval_request_id BIGINT REFERENCES admin_approval_request(id) NOT NULL,

    -- the member DOING the requesting
    requester_id BIGINT REFERENCES account(id) NOT NULL,

    -- the member from whom something is being requestd
    requestee_id BIGINT REFERENCES account(id) NOT NULL
);

CREATE TABLE event(
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    organizer_id BIGINT REFERENCES account(id) NOT NULL,
    description TEXT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL
);

CREATE TABLE event_revision(
    id BIGSERIAL PRIMARY KEY,
    original_id BIGINT REFERENCES event(id) NULL, -- null if a new event
    admin_approval_request_id BIGINT REFERENCES admin_approval_request(id) NOT NULL,
    name TEXT NOT NULL,
    organizer_id BIGINT REFERENCES account(id) NOT NULL,
    description TEXT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL
);

CREATE TABLE job_posting(
  id BIGSERIAL PRIMARY KEY,

  -- the member posting the job
  poster_id BIGINT REFERENCES account(id) NOT NULL,

  -- the job title on the posting
  title TEXT NOT NULL,

  -- the posting time for this job
  post_time DATE NOT NULL,

  -- the description for this job
  description TEXT NOT NULL,

  -- the working locationn for this job
  location TEXT NULL
);

CREATE TABLE job_posting_revision(
    id BIGSERIAL PRIMARY KEY,
    original_id BIGINT REFERENCES job_posting(id) NULL, -- null if new entry

    admin_approval_request_id BIGINT REFERENCES admin_approval_request(id) NOT NULL,

    -- the member posting the job
    poster_id BIGINT REFERENCES account(id) NOT NULL,

    -- the job title on the posting
    title TEXT NOT NULL,

    -- the posting time for this job
    post_time DATE NOT NULL,

    -- the description for this job
    description TEXT NOT NULL,

    -- the working locationn for this job
    location TEXT NULL
);

COMMIT;
