const express = require("express");
const userController = require("../controllers/userController");
const authenticateJwt = require("../middleware/authenticateJwt");

const router = express.Router();

router.get("/api/users", authenticateJwt, userController.getUser);

module.exports = router;
