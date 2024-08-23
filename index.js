const express = require('express');
const app = express();
const port = 3000;
const { Pool } = require('pg');
const { Issuer, generators } = require('openid-client');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.BD_PORT,
});

app.get('/auth', async (req, res) => {
  const googleIssuer = await Issuer.discover('https://accounts.google.com');
  const client = new googleIssuer.Client({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: ['http://localhost:3000/auth-callback'],
    response_types: ['code'],
  });

  const codeVerifier = generators.codeVerifier();
  const codeChalleng = generators.codeChallenge(codeVerifier);
  const state = generators.state();
  const nonce = generators.nonce();

   pool.query(
    'INSERT INTO auth_state(state,nonce,code_challenge,code_verifier,origin_url) VALUES($1,$2,$3,$4,$5)',
    [state, nonce, codeChalleng, codeVerifier, req.originalUrl]
  );

  const authUrl = client.authorizationUrl({
    scope: 'openid profile email',
    codeChalleng,
    code_challenge_method: 'S256',
    state,
  });

  res.redirect(authUrl);
});

app.get('/auth-callback', async (req, res) => {
  const { code, state } = req.query;
  console.log('this is code : ' + code);
  console.log('This is state : ' + state);
console.log('This is Quary : '+JSON.stringify(req.query));

  const resalt = await pool.query(
    'SELECT code_verifier FROM auth_state WHERE state = $1',
    [state]
  );
  // console.log("this is resalt : " + resalt.rows.state);
  console.log(resalt);
  if(resalt.rows.length == 0){
    console.error('No mactching state found in database');
    
  }
  const codeVerifier = resalt.rows[0].code_verifier;

  console.log('this is code valifire : ' + codeVerifier);
  console.log('this is code : ' + code);
  console.log('This is state : ' + state);

  const googleIssuer = await Issuer.discover('https://accounts.google.com');
  const client = new googleIssuer.Client({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: ['http://localhost:3000/auth-callback'],
    response_types: ['code'],
  });

  const tokenset =await client.callback(
    'http://localhost:3000/auth-callback',
    {code,state},
    {code_verifier:codeVerifier}
  );
  console.log('this is token set : '+tokenset);
  
  const userinfo = await client.userinfo(tokenset.access_token);
  console.log('this is user info : ' + userinfo);

  await pool.query(
    'INSERT INTO users(id,name,email) VALUES($1,$2,$3) ON CONFLICT DO NOTHING"',
    [userinfo.sub, userinfo.name, userinfo.email]
  );

  const refreshToken = generators.random(32);
  pool.query(
    'INSERT INTO user_token(user_id,app_refresh_token,expires_at) VALUES($1, $2, NOW() + INTERVAL ', 1, week, ')'[(userinfo.sub, refreshToken)]
  );

  res.cookie('APP_REFRSH_TOKEN', refreshToken, {
    httpOnly: true,
    secure: true,
  });
  res.redirect('/token');
});

app.listen(port, () =>
  console.log(`Server is Running on http://localhost:${port}`)
);
