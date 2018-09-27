require('dotenv').config();
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt'));
const models = require('../models');

let requiresLogin = function (req, res, next) {
	if (process.env.SKIP_AUTH === 'true' && !req.session.loginId) {
		return models.Login.findById(10).then( login => {
			if (!login) {
				return res.json({
					hasError: true,
					error: "Authentication failure"
				});
			}
			req.login = login;
			next();
		});
	}

	if (req.session && req.session.loginId) {
		models.Login.findById(req.session.loginId).then( login => {
			if (!login) {
				return res.json({
					hasError: true,
					error: "Authentication failure"
				});
			}
			req.login = login;
			next();
		}).catch( err => {
			return res.json({
				hasError: true,
				error: "Authentication failure"
			});
		});
	} else {
		res.json({
			hasError: true,
			error: "Authentication failure"
		});
	}
}

module.exports = { requiresLogin };