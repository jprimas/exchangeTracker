const express = require('express');
const path = require('path');
const BinanceHandler = require('./src/binance/BinanceHandler')

const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/getPercentageGainsOfAllCoins', (req,res) => {
	let binanceHandler = new BinanceHandler();
	binanceHandler.getPercentageGainsOfAllCoins()
	.then( result => res.json(result) )
	.catch( error => {
		console.log(error);
		res.json({
			hasError: true,
			error: "Something went wrong"
		});
	});
});

app.get('/api/getOverallPercentageGains', (req,res) => {
	let binanceHandler = new BinanceHandler();
	return binanceHandler.getOverallPercentageGains()
	.then( result => res.json(result) )
	.catch( error => {
		console.log(error);
		res.json({
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