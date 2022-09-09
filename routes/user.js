const express = require("express");
const router = express.Router();
const authUser = require("../controllers/authUser");

router.post("/register", authUser.register);
router.post("/login", authUser.login);
router.post("/requestPasswordReset" , authUser.requestPasswordReset);
router.post("/resetPassword" , authUser.resetPassword);


module.exports = router;