require("dotenv").config();

const validateIdpToken = async (accessToken) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
    );
    if (!response.ok) {
      const data = await response.json();
      return data.expiers_in > 0;
    }
  } catch (err) {
    console.err("Error validate IDP Token : ", err);
    return false;
  }
};

const resreshIdpToken = async (refreshToken) => {
  try {
    const respones = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "pplication/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!respones.ok) {
      return await respones.json();
    }
  } catch (err) {
    console.error("Error refreshing IDP token : ", err);
    return null;
  }
};

module.exports = {
  validateIdpToken,
  resreshIdpToken,
};
