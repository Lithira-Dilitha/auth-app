const { Issuer } = require("openid-client");
require("dotenv").config();

const validateIdpToken = async (accessToken) => {
  console.log("this is access token : " + accessToken);

  try {
    const googleIssuer = await Issuer.discover("https://accounts.google.com");
    const client = new googleIssuer.Client({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    });
    const tokenSet = await client.userinfo(accessToken);
    return tokenSet ? true : false;
  } catch (err) {
    console.error("Error validate IDP Token : ", err);
    return false;
  }
};

const refreshIdpToken = async (refreshToken) => {
  try {
    const respones = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!respones.ok) return null;
    return await respones.json();
  } catch (err) {
    console.error("Error refreshing IDP token : ", err);
    return null;
  }
};

module.exports = {
  validateIdpToken,
  refreshIdpToken,
};
