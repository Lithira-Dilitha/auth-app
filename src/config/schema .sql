--  this is auth_state Table query

CREATE TABLE auth_state(
    state VARCHAR(255),
    nonce VARCHAR(255),
    code_challenge VARCHAR(255),
    code_verifier VARCHAR(255),
    origin_url VARCHAR(255)
);

-- this is user_token table query

CREATE TABLE user_token(
    user_id VARCHAR(255),
    app_refresh_token VARCHAR(255),
    expires_at TIMESTAMPIZ,
    idp_access_token TEXT,
    idp_refresh_token TEXT,
    idp_expires_at TIMESTAMPIZ
);

-- this is users table query
CREATE TABLE user(
    id VARCHAR(255),
    name VARCHAR(255),
    email VARCHAR(255)
);

-- enable RSL on the user table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- this is RLS policy 
CREATE POLICY user_policy ON users
USING (id = current_setting('user_id')::VARCHAR);