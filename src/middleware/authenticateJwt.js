const jwt = require("jsonwebtoken");
const authenticateJwt = (req, res, next) => {
  const authHead = req.headers.authorization;

  if (authHead) {
    const token = authHead.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.state(403);

      req.user = user;
      next();
    });
  } else {
    res.state(401);
  }
};
module.exports = authenticateJwt;
