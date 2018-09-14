const express = require('express');
const path = require('path');
const TransactionProcessor = require('./src/helpers/TransactionProcessor')

const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/getPercentageGainsOfAllCoins', (req,res) => {
	let transactionProcessor = new TransactionProcessor();
	transactionProcessor.process();
});

app.get('/api/getOverallPercentageGains', (req,res) => {
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);