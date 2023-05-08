require("dotenv").config();
const jwt = require("jsonwebtoken");
const {User, BlackList} = require("./schemas");

//add token to blacklist
function logOut(req, res) {
	BlackList.findOneAndUpdate(
		{},
		{$push: {list: req.body.token.split(" ")[1]}},
		{
			upsert: true,
		},
		(err) => {
			err ? res.status(500).json({generalError: "log out failed"}) : res.status(200).json({updatedData: "log out success"});
		},
	);
}

//middleware check if user exist than move userId to create token
function login(req, res, next) {
	const authUser = {email: req.body.email, password: req.body.password};
	User.findOne({email: authUser.email}, (err, user) => {
		if (!user) return res.status(400).json({inputsError: "one or two of your inputs icorrect"});
		if (user.password !== authUser.password) return res.status(400).json({inputsError: "one or two of your inputs icorrect"});
		if (err) return res.status(500).json({generalError: "internal server error"});
		req.user = {userId: user._id};
		next();
	});
}

//create new user
function signUp(req, res, next) {
	const user = new User({
		img: "",
		fullName: req.body.fullName,
		email: req.body.email,
		password: req.body.password,
		address: [],
		cards: [],
		cardItems: [],
		wishlistItems: [],
		LastItems: [],
	});
	if (user.validateSync()) return res.status(400).json({inputsError: user.validateSync().errors});
	else {
		user.save((err, user) => {
			if (err || !user) {
				if (err.code == 11000) return res.status(400).json({inputsError: "user already exists"});
				return res.status(500).json({generalError: "internal server error"});
			}
			req.user = {userId: user._id};
			next();
		});
	}
}

//send token
function createToken(req, res) {
	const user = req.user;
	jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "30m"}, (err, token) => {
		if (err) res.status(500).send({generalError: "internal server error"});
		else res.status(200).json({updatedData: {accessToken: token}});
	});
}

//middleware check if token is valid than parse userId
function authenticateToken(req, res, next) {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(" ")[1];

	if (token == null) return res.status(401).json({authErr: "unexpected token"});
	BlackList.findOne((err, doc) => {
		if (err) return res.status(401).json({authErr: "unexpected token"});
		if (doc?.list.includes(token)) return res.status(403).json({authErr: "token forbidden"});
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) return res.status(500).json({generalError: "internal server error"});
			req.user = user;
			//to get userID: req.user.userId
			next();
		});
	});
}

module.exports = {
	logOut: logOut,
	login: login,
	signUp: signUp,
	createToken: createToken,
	authenticateToken: authenticateToken,
};
