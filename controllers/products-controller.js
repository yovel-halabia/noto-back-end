const router = require("express").Router();
const {getCategoryProducts, getProduct, getSalesProduct} = require("../handlers/product");

//GET api/products/category/:categoryId
router.get("/category/:categoryId", getCategoryProducts);

//GET api/products/product/:productId
router.get("/product/:productId", getProduct);

//GET api/products/sales-products
router.get("/sales-products", getSalesProduct);

module.exports = router;
