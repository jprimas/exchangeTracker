const express = require('express');
const path = require('path');
const BinanceHandler = require('./src/binance/BinanceHandler')

const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/getAllPercentageGains', (req,res) => {
	let binanceHandler = new BinanceHandler();
	return binanceHandler.getActiveSymbols()
	.then( (activeSymbols) => {
		binanceHandler.getAllPercentageGains(activeSymbols)
		.then( (result) => {
			return res.json(result);
		});
	});
});

app.get('/api/getDepositedEthValue', (req,res) => {
	let binanceHandler = new BinanceHandler();
	return binanceHandler.getEthAmountDeposited()
	.then( (result) => {
		console.log(result.totalEthDeposited);
		console.log(result.totalEthDepositedInUsd);
		return result;
	});
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);