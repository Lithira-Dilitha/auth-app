const express = require("express");
const app = express();
const port = 3000;
const {Pool} = require("pg");
const {Issuer, generators}=require('openid-client');
require('dotenv').config();

const pool = new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    password:process.env.DB_PASS,
    port:process.env.BD_PORT
});
app.get('/auth',async (req,res)=>{
    const googleIssuer = await Issuer.discover('https://accounts.google.com');

    const client = new googleIssuer.Client({
      client_id : process.env.CLIENT_ID,
      client_secret : process.env.CLIENT_SECRET,
      redirect_uris : ['http://localhost:3000/auth-callback'],
      response_types: ['code'],
    });
    const codeVerifier = generators.codeVerifier();
    const codeChalleng = generators.codeChallenge(codeVerifier);
    const state = generators.state();

    const authUrl = client.authorizationUrl({
      scope: 'openid profile email',
      codeChalleng,
      code_challenge_method:'S256',
      state,
    });
    res.redirect(authUrl);
 })
app.listen(port, () =>
  console.log(`Server is Running on http://localhost:${port}`)
);