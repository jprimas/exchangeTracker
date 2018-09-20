const Promise = require('bluebird');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = Promise.promisifyAll(require('bcrypt'));

const models = require('../models');
const { requiresLogin } = require('./middleware');

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

 router.post('/api/authenticate', [jsonParser], (req, res) => {
	if (!req || !req.body) {
		return res.json({
			hasError: true,
			error: "Invalid username or password"
		});
	}
	let userEmail = req.body.email;
	let userPassword = req.body.password;
	return models.Login.findOne({
	    where: {email: userEmail}
	}).then( login => {
		if (!login) {
			return res.json({
				hasError: true,
				error: "Invalid username or password"
			});
		} else {
			bcrypt.compareAsync(userPassword, login.password)
			.then( (validated) => {
				if (validated) {
					req.session.loginId = login.id;
					return res.sendStatus(200);
				} else {
					return res.json({
						hasError: true,
						error: "Invalid username or password"
					});
				}
			})
			.catch( (err) => {
				return res.json({
					hasError: true,
					error: "Invalid username or password"
				});
			})
		}
	});
});

router.get('/api/logout', [requiresLogin], (req, res) => {
	req.session.loginId = null;
	return res.sendStatus(200);
});

router.post('/api/register', [jsonParser], (req, res) => {
	if (!req || !req.body) {
		return res.json({
			hasError: true,
			error: "No request body"
		});
	}

	if (!req.body.email) {
		return res.json({
			hasError: true,
			error: "No Email Provided"
		});
	}

	if (!req.body.password || !req.body.confirmPassword || req.body.password != req.body.confirmPassword ) {
		return res.json({
			hasError: true,
			error: "Password Error"
		});
	}

	//TODO: Check if an email already exists

	return bcrypt.hashAsync(req.body.password, 10)
	.then( (hash) => {
		return models.Login.create({
			email: req.body.email,
			password: hash,
			binanceApiKey: req.body.binanceApiKey,
			binanceApiSecret: req.body.binanceApiSecret,
			gdaxApiKey: req.body.gdaxApiKey,
			gdaxApiSecret: req.body.gdaxApiSecret,
			gdaxApiPassphrase: req.body.gdaxApiPassphrase,
			coinbaseApiKey: req.body.coinbaseApiKey,
			coinbaseApiSecret: req.body.coinbaseApiSecret
		})
		.then( (login) => {
			req.session.loginId = login.id;
			return res.sendStatus(200);
		}).catch( () => {
			return res.json({
				hasError: true,
				error: "Unable to save to DB"
			});
		});
	});	
});

module.exports = router;