require("dotenv").config();
const jwt = require("jsonwebtoken");
const {User, BlackList} = require("../schemas");
const {mOut} = require("../utils");

function logOut(req, res, next) {
	const token = req.body.token.split(" ")[1];
	if (!token) mOut({success: false, data: "invalid token", res});

	try {
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
			if (err && err.message === "jwt expired")
				//no need to add to blacklist
				return mOut({success: true, data: "log out success", res});
			if (err) next();
			if (user) {
				const blackList = await BlackList.findOne();
				if (!blackList._doc.list.includes(token)) {
					blackList._doc.list.push(token);
					const save = await blackList.save();
					if (!save) next();
					return mOut({success: true, data: "log out success", res});
				} else return mOut({success: true, data: "log out success", res});
			}
		});
	} catch {
		next();
	}
}

async function login(req, res, next) {
	if (!req.body.email || !req.body.password) return mOut({success: false, data: "one or two of your inputs icorrect", res});
	try {
		const user = await User.findOne({email: req.body.email});
		if (user && user._doc.password === req.body.password) {
			req.user = {userId: user._id};
			next();
		} else return mOut({success: false, data: "one or two of your inputs icorrect", res});
	} catch {
		next();
	}
}

async function signUp(req, res, next) {
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
	if (user.validateSync()) return mOut({success: false, data: user.validateSync().errors, res});
	try {
		const save = await user.save();
		if (!save) next();
		req.user = {userId: save._id};
		next();
	} catch (e) {
		if (e.code === 11000) return mOut({success: false, data: "user already exists", res});
		next();
	}
}

function sendToken(req, res, next) {
	try {
		jwt.sign(req.user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "30m"}, (err, token) => {
			if (token) return mOut({success: true, data: token, res});
		});
	} catch {
		next();
	}
}

async function authenticateToken(req, res, next) {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) return mOut({success: false, data: "invalid token", res});

	try {
		const blackList = await BlackList.findOne();
		if (blackList && blackList._doc.list.includes(token)) return mOut({success: false, data: "token forbidden", res, status: 403});

		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) return mOut({success: false, data: "token forbidden", res, status: 403});
			if (user) req.user = user;
			next();
		});
	} catch {
		next();
	}
}

module.exports = {
	logOut,
	login,
	signUp,
	sendToken,
	authenticateToken,
};
