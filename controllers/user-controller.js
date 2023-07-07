const router = require("express").Router();
const {getUser, addUserItem, updateUserFiled,setUserDefault,deleteUserItem,pay} = require("../handlers/user");
const {authenticateToken} = require("../handlers/authentication");

//GET /api/user
router.get("/", authenticateToken, getUser);

//POST  /api/user/add-item
router.post("/add-item", authenticateToken, addUserItem);

//POST  /api/user/delete-item
router.post("/delete-item", authenticateToken, deleteUserItem);

//POST  /api/user/update-address
router.post("/update-field", authenticateToken, updateUserFiled);

//POST /api/user/set-default
router.post("/set-default", authenticateToken, setUserDefault);

//route for pay
router.post("/pay", authenticateToken, pay);

module.exports = router;
