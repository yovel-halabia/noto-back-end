function mOut({success, data, res, status=200}) {
	res.status(status).json({success, data: data});
}

module.exports = mOut;
