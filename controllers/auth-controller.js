const router = require("express").Router();
const {logOut, login, signUp, sendToken, authenticateToken} = require("../handlers/authentication");
const {mOut} = require("../utils");

//POST api/auth/login
router.post("/login", login, sendToken);

//POST api/auth/signup
router.post("/signup", signUp, sendToken);

//POST api/auth/logout
router.post("/logout", logOut);

//GET api/auth/check-token
router.get("/check-token", authenticateToken, (req, res) => {
	return mOut({success: true, data: "valid token", res});
});

module.exports = router;
