require("dotenv").config();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const addressSchema = new mongoose.Schema({
	addressName: {type: String, required: [true, "this filed is required"]},
	city: {type: String, required: [true, "this filed is required"]},
	street: {type: String, required: [true, "this filed is required"]},
	zipCode: {type: String, required: [true, "this filed is required"]},
	default: Boolean,
});

const cardSchema = new mongoose.Schema({
	number: {type: String, required: [true, "Invalid card ID"], minLength: [16, "Invalid card ID"]},
	date: {type: String, required: [true, "Invalid date"], minLength: [5, "Invalid date"]},
	cvv: {type: String, required: [true, "Invalid CVV"], minLength: [3, "Invalid CVV"]},
	company: {type: String, required: [true, "you must use visa or Muster Card"]},
	default: Boolean,
});

const cartSchema = new mongoose.Schema({
	productID: {type: String, required: true},
	color: {type: String, required: true},
	size: {type: String, required: true},
	qty: {type: Number, required: true},
});

const orderSchema = new mongoose.Schema({
	items: [cartSchema],
	address: addressSchema,
});

const userSchema = new mongoose.Schema({
	img: String,
	fullName: {type: String, required: [true, "this filed is required"]},
	email: {
		type: String,
		unique: [true, "user already exist"],
		validate: {
			validator: function (v) {
				return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
			},
			message: (props) => `${props.value} is not a valid email`,
		},
		required: [true, "this filed is required"],
	},
	password: {
		type: String,
		required: [true, "this filed is required"],
		minLength: [8, "password must contain at least 8 characters"],
	},
	address: [addressSchema],
	cards: [cardSchema],
	cartItems: [cartSchema],
	wishlistItems: [cartSchema],
	orders: [orderSchema],
});

userSchema.plugin(encrypt, {
	secret: process.env.PASSWORD_SECRET,
	encryptedFields: ["password", "cards", "address"],
});

const User = mongoose.model("User", userSchema);

const balckListSchema = new mongoose.Schema({
	list: Array,
});
const BlackList = mongoose.model("BlackList", balckListSchema);

const productSchema = new mongoose.Schema({
	category: String,
	title: String,
	description: String,
	img: String,
	price: String,
	color: Array,
});

const Product = mongoose.model("Product", productSchema);

const salesProductSchema = new mongoose.Schema({
	products:Array,
})

const salesProduct = mongoose.model("salesProduct", salesProductSchema);

module.exports = {
	User: User,
	BlackList: BlackList,
	Product: Product,
	salesProduct: salesProduct,
};
