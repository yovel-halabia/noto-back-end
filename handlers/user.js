const {User} = require("../schemas");
const {mOut} = require("../utils");

const VALID_FIELDS = [
"password",
"fullName",
"password",
"address",
"cards",
"wishlistItems",
];

async function getUser(req, res, next) {
	try {
		const user = await User.findOne({_id: req.user.userId});
		if (!user) next();
		return mOut({
			success: true,
			data: {
				//TODO: find way to beutify this data object
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
			res,
		});
	} catch (e){
		next();
	}
}


async function updateUserFiled(req, res, next) {

	try {
		const user = await User.findOne({_id: req.user.userId});
		if (!user) next();

		for(var key in req.body){
			const field = req.body[key];
			if(!user._doc[key] || !VALID_FIELDS.includes(key)) return mOut({success: false, data: "bad request", res, status: 400});

			if(Array.isArray(user._doc[key])){
				if(!user._doc[key].id(field._id)) return mOut({success: false,data:"fail to update field",res});
				user._doc[key].id(field._id)._doc = field;
			} 
			else  user[key] = field;

		}

		const save = await user.save();
		if (!save) next();

		return mOut({success: true, data: "fields updated succefully", res});



	} catch (e){
		if(e._message) return mOut({success:false,data:e._message,res});
		next();
	}
}


async function setUserDefault(req, res, next) {
	
	try {
		const user = await User.findOne({_id: req.user.userId});
		if (!user) next();

		var setSuccess = false;
		for(var key in req.body){
			if(!user._doc[key] || !Array.isArray(user._doc[key]) || !['cards','address'].includes(key)) return mOut({success: false, data: "bad request", res, status: 400});
			
			const {_id} = req.body[key];
			user[key] = user[key].map((item)=>{
				item._doc.default = item._id.toString() === _id ? true : false;
				setSuccess = true;
				return item;
			});
		}

		if(!setSuccess)return mOut({success: false, data: "fail set field to default", res});

		const save = await user.save();
		if (!save) next();

		return mOut({success: true, data: "field set to default", res});
	} catch (e){
		next();
	}
}

async function deleteUserItem(req, res, next) {

	try {
		const user = await User.findOne({_id: req.user.userId});
		if (!user) next();

		for(var key in req.body){
			if(!user._doc[key] || !Array.isArray(user._doc[key]) || !VALID_FIELDS.includes(key) ) return mOut({success: false, data: "bad request", res, status: 400});
			const {_id} = req.body[key];
			if(!user._doc[key].id(_id)) return mOut({success: false, data:"fail to delete item",res});
			user._doc[key] = user._doc[key].filter((item)=>item._id.toString() !== _id);
		}

		const save = await user.save();
		if (!save) next();

		return mOut({success: true, data: "field delete successfully", res});
	} catch {
		next();
	}
}



async function addUserItem(req,res,next){
	
	try {
		const user = await User.findOne({_id: req.user.userId});
		if (!user) next();
		for(var key in req.body){
			if(!user._doc[key] || !Array.isArray(user._doc[key]) || (!VALID_FIELDS.includes(key) || key === 'orders')) return mOut({success: false, data: "bad request", res, status: 400});
			const field = req.body[key];
			if(user._doc[key].id(field._id)) return mOut({success:false,data:"item already added",res});
			user._doc[key].push(field);
		}

		const save = await user.save();
		if(!save) next();

		return mOut({success:true,data:"items added successfully",res});



	}catch(e){
		if(e._message) return mOut({success:false,data:e._message,res});
		next();
	}
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
	getUser,
	updateUserFiled,
	setUserDefault,
	deleteUserItem,
	addUserItem,
	pay,
};
