const {Product, salesProduct} = require("./schemas");

function addProducts(req, res) {
	req.body.items.forEach((item) => {
		const product = new salesProduct(item);
		product.save((err) => {
			if (err) return res.status(500).json({generalError: "internal server error"});
		});
	});
	return res.status(200).json({updatedData: "product added successfully"});
}

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

module.exports = {addProducts, getCategoryProducts, getProduct, getSalesProduct};
