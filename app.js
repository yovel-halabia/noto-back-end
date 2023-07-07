require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const {authController, productsController, userController} = require("./controllers");
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(express.static("public"));

//connect to DB
mongoose.connect(process.env.MONGODB_ACCESS_LINK, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

//routes
app.get("/tst", (req, res, next) => {
	next();
});
app.use("/api/user", userController);
app.use("/api/products", productsController);
app.use("/api/auth", authController);

//general error
app.use((req, res) => {
	res.status(500).json({alertMessage: "internal server error"});
});


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
