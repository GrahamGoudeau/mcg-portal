BEGIN;

-- password for these accounts is just 'password', hashed against the dev JWT key
INSERT INTO account(email, password_digest, first_name, last_name, enrollment_type) VALUES(
    'test@example.com',
    '$2b$12$KuZta9JGWDgtd05EPbm8M.lYMex0jyOLhUSBbjEU3pm0N9SQaJGUG',
    'Test',
    'Account',
    NULL
);

INSERT INTO account(email, password_digest, first_name, last_name, enrollment_type) VALUES(
    'admin-for-unit-tests',
    '$2b$12$KuZta9JGWDgtd05EPbm8M.lYMex0jyOLhUSBbjEU3pm0N9SQaJGUG',
    'Test',
    'Account',
    NULL
);

INSERT INTO account(email, password_digest, first_name, last_name, enrollment_type) VALUES(
    'non-admin-for-unit-tests',
    '$2b$12$KuZta9JGWDgtd05EPbm8M.lYMex0jyOLhUSBbjEU3pm0N9SQaJGUG',
    'Test',
    'Account',
    NULL
);

INSERT INTO admin_account(account_id) VALUES
    ((SELECT id FROM account WHERE email = 'test@example.com')),
    ((SELECT id FROM account WHERE email = 'admin-for-unit-tests'))
;

COMMIT;
