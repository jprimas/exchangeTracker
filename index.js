const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
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


app.get('/api/authenticate', (req, res) => {
	if (!req || !req.query || !req.query.email) {
		return res.json({
			hasError: true,
			error: "No email was provided5"
		});
	}
	let userEmail = req.query.email;
	return models.Login.findOne({
	    where: {email: userEmail}
	}).then( login => {
		if (!login) {
			return models.Login.create({
				email: userEmail
			}).then( newLogin =>{
				req.session.loginId = newLogin.id;
				return res.json();
			})
		} else {
			req.session.loginId = login.id;
			return res.json();
		}
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