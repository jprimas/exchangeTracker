const express = require('express');
const Promise = require('bluebird');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config(); 
const TransactionProcessor = require('./src/helpers/TransactionProcessor');
const TaxHelper = require('./src/helpers/TaxHelper');
const models = require('./src/models');
const { requiresLogin } = require('./src/routes/middleware');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
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


app.use('/', authRoutes);

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
	return transactionProcessor.getAllTransactionsDecoupled()
	.then( result => {
		//console.log(result);
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

app.get('/api/secure/calculateTaxes', [requiresLogin], (req,res) => {
	if (!req.query.year || !req.query.netIncome || req.query.year < 2000 || req.query.year > 2050) {
		return res.json({
			hasError: true,
			error: "Invalid Input Params"
		});
	}

	let transactionProcessor = new TransactionProcessor(req.login);
	return transactionProcessor.calculateCapitalGains(req.login, req.query.year, req.query.netIncome)
	.then( result => {
		console.log(result);
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

app.get('/api/secure/getTaxInfo', [requiresLogin], (req,res) => {
	if (!req.login.taxYear || !req.login.netIncome) {
		return res.sendStatus(200);
	}

	let result = {
		year: req.login.taxYear,
		netIncome: req.login.netIncome,
		shortTermCapitalGains: req.login.shortTermCapitalGains,
		longTermCapitalGains: req.login.longTermCapitalGains,
		shortTermCapitalLosses: req.login.shortTermCapitalLosses,
		longTermCapitalLosses: req.login.longTermCapitalLosses,
	};
	result.estimatedTaxes = TaxHelper.estimateTaxes(req.login.taxYear, result)
	return res.json(result);
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);