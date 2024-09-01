const express = require('express');
const userController = require('../controllers/userController');
const authenticateJwt = require('../middleware/authenticateJwt');
const setUserContext = require('../middleware/setUserContext');

const router = express.Router();

router.get("/api/users",authenticateJwt,setUserContext,userController.getUser);

module.exports = router;