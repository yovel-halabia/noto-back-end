function mOut({success, data, res, status=200}) {
	if (success) res.status(status).json({success: true, data: data});
	else res.status(status).json({success: false, alertMessage: data});
}

module.exports = mOut;
