const {User, Product} = require("../schemas");
const {mOut} = require("../utils");

const VALID_FIELDS = ["email", "password", "fullName", "address", "cards", "cartItems", "wishlistItems"];
const VALID_FIELDS_TO_RES = ["email", "fullName", "address", "cards", "cartItems", "wishlistItems", "orders"];

async function getUser(req, res, next) {
	try {
		const user = await User.findOne({_id: req.user.userId});
		if (!user) next();
		const data = await data2res(user, Object.keys(user._doc));
		return mOut({success: true, data, res});
	} catch (e) {
		next();
	}
}

async function updateUserFiled(req, res, next) {
	try {
		const user = await User.findOne({_id: req.user.userId});
		if (!user) next();

		for (var key in req.body) {
			const field = req.body[key];
			if (!field) continue;
			if (!user[key] || !VALID_FIELDS.includes(key)) return mOut({success: false, data: "bad request", res, status: 400});

			if (Array.isArray(user[key])) {
				if (!user[key].id(field._id)) return mOut({success: false, data: "fail to update field", res});
				user[key].id(field._id)._doc = field;
			} else user[key] = field;
		}

		const save = await user.save();
		if (!save) next();

		const data = await data2res(save, Object.keys(req.body));

		return mOut({success: true, data, res});
	} catch (e) {
		if (e.code === 11000)
			//try to use mail that already exist
			return mOut({success: false, data: {email: "Email already exist"}, res});
		if (e.errors) {
			//field validation error
			const errors = {};
			for (var key in e.errors) {
				errors[key] = e.errors[key].message;
			}
			return mOut({success: false, data: errors, res});
		}
		if (e._message) return mOut({success: false, data: e._message, res});
		next();
	}
}

async function addUserItem(req, res, next) {
	try {
		const user = await User.findOne({_id: req.user.userId});
		if (!user) next();
		for (var key in req.body) {
			if (!user[key] || !Array.isArray(user[key]) || !VALID_FIELDS.includes(key) || key === "orders")
				return mOut({success: false, data: "bad request", res, status: 400});
			const field = req.body[key];
			if (user[key].id(field._id)) return mOut({success: false, data: "item already added", res});
			user[key].push(field);
		}

		const save = await user.save();
		if (!save) next();

		const data = await data2res(save, Object.keys(req.body));

		return mOut({success: true, data, res});
	} catch (e) {
		if (e.errors) {
			//field validation error
			const errors = {};
			for (var key in e.errors) {
				errors[key] = e.errors[key].message;
			}
			return mOut({success: false, data: errors, res});
		}
		if (e._message) return mOut({success: false, data: e._message, res});
		next();
	}
}

async function setUserDefault(req, res, next) {
	try {
		const user = await User.findOne({_id: req.user.userId});
		if (!user) next();

		var setSuccess = false;
		for (var key in req.body) {
			if (!user[key] || !Array.isArray(user[key]) || !["cards", "address"].includes(key))
				return mOut({success: false, data: "bad request", res, status: 400});

			const {_id} = req.body[key];
			user[key] = user[key].map((item) => {
				item._doc.default = item._id.toString() === _id;
				if (item._id.toString() === _id) setSuccess = true;
				return item;
			});
		}

		if (!setSuccess) return mOut({success: false, data: "fail set field to default", res});

		const save = await user.save();
		if (!save) next();

		return mOut({success: true, data: "field set to default", res});
	} catch (e) {
		console.log(e);
		next();
	}
}

async function deleteUserItem(req, res, next) {
	try {
		const user = await User.findOne({_id: req.user.userId});
		if (!user) next();

		for (var key in req.body) {
			if (!user[key] || !Array.isArray(user[key]) || !VALID_FIELDS.includes(key))
				return mOut({success: false, data: "bad request", res, status: 400});
			const {_id} = req.body[key];
			if (!user[key].id(_id)) return mOut({success: false, data: "fail to delete item", res});
			user[key] = user[key].filter((item) => item._id.toString() !== _id);
		}

		const save = await user.save();
		if (!save) next();

		return mOut({success: true, data: "item removed successfully", res});
	} catch {
		next();
	}
}

async function pay(req, res, next) {
	try {
		const user = await User.findOne({_id: req.user.userId});
		user["orders"].push(req.body);
		user["cartItems"] = [];

		const save = await user.save();
		if (!save) next();

		const data = await data2res(save, ["orders", "cartItems"]);
		return mOut({success: true, data, res});
	} catch {
		next();
	}
}

async function data2res(data, fields) {
	data = data.toObject();
	var res = {};
	for (var field of fields) {
		if (!VALID_FIELDS_TO_RES.includes(field)) continue;

		//special cases
		if (field === "cards") {
			res[field] = data[field].map((item) => {
				return {...item, number: "**** **** **** " + item.number.split(" ")[3]};
			});
		} else if (field === "cartItems" || field === "wishlistItems") {
			res[field] = await Promise.all(
				data[field].map(async (item) => {
					const product = await Product.findOne({_id: item.productID});

					return {...item, productData: {...product._doc}};
				}),
			);
		} else if (field === "orders") {
			res[field] = await Promise.all(
				data[field].map(async (order) => {
					order.items = await Promise.all(
						order.items.map(async (item) => {
							const product = await Product.findOne({_id: item.productID});

							return {...item, productData: {...product._doc}};
						}),
					);
					return order;
				}),
			);
		} else res[field] = data[field];
	}

	return res;
}

module.exports = {
	getUser,
	updateUserFiled,
	setUserDefault,
	deleteUserItem,
	addUserItem,
	pay,
};
