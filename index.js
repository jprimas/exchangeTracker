const express = require('express');
const path = require('path');
const BinanceHandler = require('./src/binance/BinanceHandler')

const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/getPercentageGainsOfAllCoins', (req,res) => {
	let binanceHandler = new BinanceHandler();
	return binanceHandler.getActiveSymbols()
	.then( (activeSymbols) => {
		binanceHandler.getPercentageGainsOfAllCoins(activeSymbols)
		.then( result => res.json(result) );
	});
});

app.get('/api/getOverallPercentageGains', (req,res) => {
	let binanceHandler = new BinanceHandler();
	return binanceHandler.getOverallPercentageGains()
	.then( result => res.json(result) ); //{
		
	// });
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);