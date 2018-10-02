require('dotenv').config();
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = Promise.promisifyAll(require('bcrypt'));
const Sequelize = require('sequelize');
const models = require('../models');
const { requiresLogin } = require('./middleware');

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

 router.post('/api/authenticate', [jsonParser], (req, res) => {
 	// Check if we have an email and password
	if (!req || !req.body || !req.body.email || !req.body.password) {
		return res.json({
			hasError: true,
			error: "Invalid username or password"
		});
	}
	let userEmail = req.body.email;
	let userPassword = req.body.password;
	return models.Login.findOne({
		where: Sequelize.where(
			Sequelize.fn('lower', Sequelize.col('email')),
			Sequelize.fn('lower', userEmail))
	})
	.then( login => {
		// Check if we have a login for the email
		if (!login) {
			return res.json({
				hasError: true,
				error: "Invalid username or password"
			});
		} else {
			// Check if the passwords match
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
			});
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
			error: "User creation failure"
		});
	}

	// User enter an email
	if (!req.body.email) {
		return res.json({
			hasError: true,
			error: "Missing Email"
		});
	}

	// User entered a valid password
	if (!req.body.password || !req.body.confirmPassword || req.body.password != req.body.confirmPassword ) {
		return res.json({
			hasError: true,
			error: "Missing or Mismatched Email"
		});
	}

	// Check if the email already exists
	return models.Login.findOne({
		where: Sequelize.where(
			Sequelize.fn('lower', Sequelize.col('email')),
			Sequelize.fn('lower', userEmail))
	})
	.then( login => {
		if (login) {
			return res.json({
				hasError: true,
				error: "Account already exists for: " + req.body.email
			});
		}

		// Hash the password
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
			})
			.catch( () => {
				return res.json({
					hasError: true,
					error: "Unable to save to DB"
				});
			});
		});	
	});
});

router.get('/api/userInfo', (req, res) => {
	if (process.env.SKIP_AUTH === 'true') {
		return res.json({
			isLoggedIn: true
		});
	}

	if (req.session.loginId) {
		//Logged in
		return res.json({
			isLoggedIn: true
		});
	} else {
		//Logged out
		return res.json({
			isLoggedIn: false
		});
	}
});

module.exports = router;