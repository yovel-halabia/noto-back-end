const {User} = require("./schemas");

function getUser(req, res) {
	User.findOne({_id: req.user.userId}, (err, user) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		if (!user) res.status(401).json({authErr: "user not exist"});
		res.status(200).json({
			updatedData: {
				fullName: user.fullName,
				email: user.email,
				address: user.address,
				cards: user.cards.map((item) => {
					return {
						_id: item._id,
						date: item.date,
						cvv: item.cvv,
						default: item.default,
						company: item.company,
						number: "**** **** **** " + item.number.split(" ")[3],
					};
				}),
				cartItems: user.cartItems,
				wishlistItems: user.wishlistItems,
				orders: user.orders,
			},
		});
	});
}

function updateAddress(req, res) {
	User.findOne({_id: req.user.userId}, (err, user) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		if (!user) res.status(401).json({authErr: "user not exist"});
		switch (req.headers.method) {
			case "ADD":
				user.address.push(req.body);
				break;
			case "UPDATE":
				Object.keys(req.body).forEach((key) => {
					user.address.id(req.body._id)[key] = req.body[key];
				});
				break;
			case "SET_DEFAULT":
				user.address.forEach((addressItem) => {
					if (addressItem._id.toString() === req.body._id) user.address.id(addressItem._id).default = true;
					else user.address.id(addressItem._id).default = false;
				});

				break;
			case "DELETE":
				user.address.id(req.body._id).remove();
				break;
			default:
				res.status(500).json({generalError: "wrong update method"});
		}
		user.save((err, data) => {
			if (err?.errors) return res.status(400).json({inputsError: err.errors});
			else if (err) res.status(500).json({generalError: "internal server error"});
			res.status(200).json({updatedData: {address: data.address}});
		});
	});
}

function updateCards(req, res) {
	User.findOne({_id: req.user.userId}, (err, user) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		if (!user) res.status(401).json({authErr: "user not exist"});
		switch (req.headers.method) {
			case "ADD":
				user.cards.push(req.body);
				break;
			case "SET_DEFAULT":
				user.cards.forEach((cardItem) => {
					if (cardItem._id.toString() === req.body._id) user.cards.id(cardItem._id).default = true;
					else user.cards.id(cardItem._id).default = false;
				});
				break;
			case "DELETE":
				user.cards.id(req.body._id).remove();
				break;
			default:
				res.status(400).json({inputsError: "wrong method"});
		}
		user.save((err, data) => {
			if (err?.errors) return res.status(400).json({inputsError: err.errors});
			else if (err) return res.status(500).json({generalError: "internal server error"});
			data.cards.forEach((cardItem) => {
				cardItem.number = "**** **** **** " + cardItem.number.split(" ")[3];
			});
			res.status(200).json({updatedData: {cards: data.cards}});
		});
	});
}

function updateUserFileds(req, res) {
	User.findOne({_id: req.user.userId}, (err, user) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		if (!user) res.status(401).json({authErr: "user not exist"});

		for (update in req.body) {
			if (update === "password") {
				if (req.body.password !== "") user[update] = req.body[update];
			} else user[update] = req.body[update];
		}

		user.save((err, data) => {
			if (err?.errors) return res.status(400).json({inputsError: err.errors});
			else if (err) return res.status(500).json({generalError: "internal server error"});
			return res.status(200).json({updatedData: {email: data.email, fullName: data.fullName}});
		});
	});
}

function updateCart(req, res) {
	User.findOne({_id: req.user.userId}, (err, user) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		if (!user) res.status(401).json({authErr: "user not exist"});

		const newItem = req.body;
		switch (req.headers.method) {
			case "ADD":
				var isUpdate = false;
				user.cartItems.items = user.cartItems.items.map((cartItem) => {
					if (cartItem._id === newItem._id) {
						isUpdate = true;
						return newItem;
					} else return cartItem;
				});
				if (!isUpdate) user.cartItems.items = [...user.cartItems.items, newItem];
				user.cartItems.total = user.cartItems.items.reduce((total, item) => total + parseFloat(item.price), 0);
				break;
			case "DELETE":
				user.cartItems.items = user.cartItems.items.filter((cartItem) => cartItem._id !== newItem._id);
				user.cartItems.total = user.cartItems.items.reduce((total, item) => total + parseFloat(item.price), 0);
				break;
			default:
				res.status(400).json({inputsError: "wrong method"});
		}
		user.save((err, data) => {
			if (err) return res.status(500).json({generalError: "internal server error"});
			return res.status(200).json({updatedData: {cartItems: data.cartItems}});
		});
	});
}

function updateWishlist(req, res) {
	User.findOne({_id: req.user.userId}, (err, user) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		if (!user) res.status(401).json({authErr: "user not exist"});

		const newItem = req.body;
		switch (req.headers.method) {
			case "ADD":
				var isUpdate = false;
				user.wishlistItems = user.wishlistItems.map((wishlistItem) => {
					if (wishlistItem._id === newItem._id) {
						isUpdate = true;
						return newItem;
					} else return wishlistItem;
				});
				if (!isUpdate) user.wishlistItems = [...user.wishlistItems, newItem];
				break;
			case "DELETE":
				user.wishlistItems = user.wishlistItems.filter((wishlistItem) => wishlistItem._id !== newItem._id);
				break;
			default:
				res.status(400).json({inputsError: "wrong method"});
		}
		user.save((err, data) => {
			if (err) return res.status(500).json({generalError: "internal server error"});
			return res.status(200).json({updatedData: {wishlistItems: data.wishlistItems}});
		});
	});
}

function pay(req, res) {
	User.findOne({_id: req.user.userId}, (err, user) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		if (!user) res.status(401).json({authErr: "user not exist"});

		user.orders.push(req.body);

		user.save((err, data) => {
			if (err) return res.status(500).json({generalError: "internal server error"});
			return res.status(200).json({updatedData: {orders: data.orders}});
		});
	});
}

module.exports = {
	getUser: getUser,
	updateAddress: updateAddress,
	updateCards: updateCards,
	updateUserFileds: updateUserFileds,
	updateCart: updateCart,
	updateWishlist: updateWishlist,
	pay: pay,
};
