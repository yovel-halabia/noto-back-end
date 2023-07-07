const {Product, salesProduct} = require("../schemas");

function getCategoryProducts(req, res) {
	Product.find({category: req.params.categoryId}, (err, products) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		return res.status(200).json({updatedData: products});
	});
}

function getProduct(req, res) {
	Product.findById(req.params.productId, (err, product) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		return res.status(200).json({updatedData: product});
	});
}

function getSalesProduct(req, res) {
	salesProduct.find((err, product) => {
		if (err) return res.status(500).json({generalError: "internal server error"});
		return res.status(200).json({updatedData: product});
	});
}

module.exports = {getCategoryProducts, getProduct, getSalesProduct};
