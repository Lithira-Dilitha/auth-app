const jwt = require("jsonwebtoken");
const { getKeyPair } = require("../config/keys");
const authenticateJwt = async (req, res, next) => {
  const authHead = req.headers.authorization;
  if (authHead) {
    const { publicKey } = await getKeyPair();
    const token = authHead.split(" ")[1];
    jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (err, user) => {
      if (err) return res.status(403).send("Forbidden");
      req.user = user;
      next();
    });
  } else {
    res.state(401).send("Unauthorized");
  }
};
module.exports = authenticateJwt;
