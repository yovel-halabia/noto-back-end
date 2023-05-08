require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const {logOut: logOut, login: login, signUp: signUp, createToken: createToken, authenticateToken: authenticateToken} = require("./authentication");
const {getUser, updateAddress, updateCards, updateUserFileds, updateCart, updateWishlist, pay} = require("./user");
const {addProducts, getCategoryProducts, getProduct, getSalesProduct} = require("./product");
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(express.static("public"));

//connect to DB
mongoose.connect(process.env.MONGODB_ACCESS_LINK, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

/*
response examples

status code 200
data
{updatedData:<data>}

status code 400
invalid inputs
{inputsError:<err>}


status code 401
auth err
{authErr:<err>}

status code 500
general error
{generalError:<err>}

*/

//authentication
//add token to blacklist
app.post("/api/logout", logOut);

//get user fields check if user exists than return token to client
app.post("/api/login", login, createToken);

//get new use fields add to DB and return token to client
app.post("/api/signup", signUp, createToken);

//verify token
app.get("/api/check-token", authenticateToken, (req, res) => {
	res.status(200).json({updatedData: {accessToken: req.headers.authorization}});
});

//user
//get data for app.js component
app.get("/api/get-user", authenticateToken, getUser);

//CROS route for address in DB
app.post("/api/update-address", authenticateToken, updateAddress);

//CROS route for card in DB
app.post("/api/update-cards", authenticateToken, updateCards);

//CROS route for other fileds in DB
app.post("/api/update-user-fileds", authenticateToken, updateUserFileds);

//CROS route for cart in DB
app.post("/api/update-cart", authenticateToken, updateCart);

//CROS route for cart in DB
app.post("/api/update-wishlist", authenticateToken, updateWishlist);

//route for pay
app.post("/api/pay", authenticateToken, pay);

//products
//routes for products
app.post("/api/add-products", addProducts);

//routes for cayegory products
app.get("/api/get-category-products/:categoryId", getCategoryProducts);

//routes for product
app.get("/api/get-product/:productId", getProduct);

//routes for salesproducts
app.get("/api/get-sales-product", getSalesProduct);

//frontend
app.get("/*", (req, res) => {
	res.sendFile("index.html", {root: path.join(__dirname, "public")});
});

//checkups
mongoose.connection.on("connected", () => {
	console.log("DB is conected");
});
app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});

module.exports = app;
