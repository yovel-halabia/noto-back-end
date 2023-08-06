const {Product, salesProduct} = require("../schemas");
const {mOut} = require("../utils");

function getCategoryProducts(req, res) {
	Product.find({category: req.params.categoryId}, (err, products) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		return mOut({data: products, res});
	});
}

function getProduct(req, res) {
	Product.findById(req.params.productId, (err, product) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		return mOut({data: product, res});
	});
}

function getSalesProduct(req, res) {
	salesProduct.find((err, products) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		return mOut({data: products[0], res});
	});
}

module.exports = {getCategoryProducts, getProduct, getSalesProduct};
