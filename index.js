const express = require('express');
const Promise = require('bluebird');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = Promise.promisifyAll(require('bcrypt'));
const TransactionProcessor = require('./src/helpers/TransactionProcessor');
const models = require('./src/models');
require('dotenv').config();  

const app = express();
//Setup DB

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
//Setup Session
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}));


//START MIDDLEWARE

let requiresLogin = function (req, res, next) {
	console.log(req.session);
	if (req.session && req.session.loginId) {
		models.Login.findById(req.session.loginId).then( login => {
			if (!login) {
				return res.json({
					hasError: true,
					error: "No email was provided"
				});
			}
			req.login = login;
			next();
		}).catch( err => {
			return res.json({
				hasError: true,
				error: "No email was provided"
			});
		});
	} else {
		res.json({
			hasError: true,
			error: "No email was provided"
		});
	}
}

//END MIDDLEWARE


app.post('/api/authenticate', [jsonParser], (req, res) => {
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
			.then( (result) => {
				req.session.loginId = login.id;
				return res.sendStatus(200);
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

app.post('/api/register', [jsonParser], (req, res) => {
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

app.get('/api/secure/processPurse', [requiresLogin], (req,res) => {
	let transactionProcessor = new TransactionProcessor(req.login);
	return transactionProcessor.process()
	.then( result => {
		return res.json(result) 
	})
	.catch( error => {
		console.log(error);
		return res.json({
			hasError: true,
			error: "Something went wrong"
		});
	});
});

app.get('/api/secure/getTransactions', [requiresLogin], (req,res) => {
	let transactionProcessor = new TransactionProcessor(req.login);
	return transactionProcessor.getAllTransactions()
	.then( result => {
		return res.json(result) 
	})
	.catch( error => {
		console.log(error);
		return res.json({
			hasError: true,
			error: "Something went wrong"
		});
	});
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);