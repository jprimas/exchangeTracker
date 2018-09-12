CommonUtil = {
    formatAsPercentage: function(value) {
        return ((value - 1) * 100).toFixed(2);
    },

    orderJsonObjectAlphabetically(jsonObject) {
		let ordered = {};
		Object.keys(jsonObject).sort().forEach(function(key) {
			ordered[key] = jsonObject[key];
		});
		return ordered;
	},
}

TransactionTypes = {
	DEPOSIT: 'deposit', 
	WITHDRAW: 'withdraw', 
	TRADE: 'trade',
	TRANSFER: 'transfer'
}

module.exports = {CommonUtil, TransactionTypes};