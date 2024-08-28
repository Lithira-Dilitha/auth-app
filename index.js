const express = require("express");
const app = express();
const port = 3000;
const { Pool } = require("pg");
const { Issuer, generators } = require("openid-client");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.BD_PORT,
});

app.get("/auth", async (req, res) => {
  const googleIssuer = await Issuer.discover("https://accounts.google.com");
  const client = new googleIssuer.Client({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: ["http://localhost:3000/auth-callback"],
    response_types: ["code"],
  });

  const codeVerifier = generators.codeVerifier();
  const codeChalleng = generators.codeChallenge(codeVerifier);
  const state = generators.state();
  const nonce = generators.nonce();

  const my_state = state;
  console.log();

  pool.query(
    "INSERT INTO auth_state(state,nonce,code_challenge,code_verifier,origin_url) VALUES($1,$2,$3,$4,$5)",
    [state, nonce, codeChalleng, codeVerifier, req.originalUrl]
  );

  const authUrl = client.authorizationUrl({
    scope: "openid profile email",
    codeChalleng,
    code_challenge_method: "S256",
    state,
  });

  res.redirect(authUrl);
});

app.get("/auth-callback", async (req, res) => {
  const { code, state } = req.query;
  console.log("this is code : " + code);
  console.log("This is state : " + state);
  console.log("This is Quary : " + JSON.stringify(req.query));

  const resalt = await pool.query(
    "SELECT code_verifier FROM auth_state WHERE state = $1",
    [state]
  );
  // console.log("this is resalt : " + resalt.rows.state);
  console.log(resalt);
  if (resalt.rows.length == 0) {
    console.error("No mactching state found in database");
  }
  const codeVerifier = resalt.rows[0].code_verifier;

  console.log("this is code valifire : " + codeVerifier);
  console.log("this is code : " + code);
  console.log("This is state : " + state);

  const googleIssuer = await Issuer.discover("https://accounts.google.com");
  const client = new googleIssuer.Client({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: ["http://localhost:3000/auth-callback"],
    response_types: ["code"],
  });

  const tokenset = await client.callback(
    "http://localhost:3000/auth-callback",
    { code, state },
    { state: state }
  );
  console.log("this is token set : " + JSON.stringify(tokenset));

  const userinfo = await client.userinfo(tokenset.access_token);
  console.log("this is user info : " + JSON.stringify(userinfo));

  await pool.query(
    "INSERT INTO users(id,name,email) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
    [userinfo.sub, userinfo.name, userinfo.email]
  );

  const refreshToken = generators.random(32);
  pool.query(
    "INSERT INTO user_token(user_id,app_refresh_token,expires_at) VALUES($1, $2, NOW() + INTERVAL '1 week')",
    [userinfo.sub, refreshToken]
  );
  res.cookie("APP_REFRSH_TOKEN", refreshToken, {
    httpOnly: true,
    secure: true,
  });
  res.redirect("/token");
});

app.get("/token", async (req, res) => {
  const refreshToken = req.cookies.APP_REFRSH_TOKEN;
  console.log("This is /token reqset : " + JSON.stringify(refreshToken));
  if (!refreshToken) return res.status(401).send("Unauthorized");

  const resalt = await pool.query(
    "SELECT user_id FROM user_token WHERE app_refresh_token = $1 AND expires_at > NOW()",
    [refreshToken]
  );
  if (resalt.rows.length == 0) return res.status(401).send("Unauthorized");

  const { user_id } = resalt.rows[0];
  const userResalt = await pool.query(
    "SELECT name, email FROM users WHERE id = $1",
    [user_id]
  );

  const token = jwt.sign(
    {
      sub: user_id,
      name: userResalt.rows[0].name,
      email: userResalt.rows[0].email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  console.log("This is Token : " + JSON.stringify(token));

  res.json({ access_token: token });
});

const authenticateJwt = (req,res,next)=>{
  const authHead = req.headers.authorization;

  if(authHead){
    const token = authHead.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET,(err,user)=>{
      if(err) return res.state(403);

      req.user = user;
      next();
    });
  }else{
    res.state(401);
  }
}

app.get("/api/users",authenticateJwt,async(req,res)=>{
  const resalt = await pool.query("SELECT id,name,email FROM users WHERE id = $1",[req.user.sub]);
  res.json(resalt.rows[0]);
})
app.listen(port, () =>
  console.log(`Server is Running on http://localhost:${port}`)
);
