const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/auth", authController.auth);
router.get("/auth-callback", authController.authCallback);
router.get("/token", authController.token);

module.exports = router;
