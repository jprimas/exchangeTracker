CommonUtil = {
    formatAsPercentage: function(value) {
        return ((value - 1) * 100).toFixed(2);
    },

    formatWithTwoDecimals: function(value) {
        return value.toFixed(2);
    },

    formatWithEightDecimals: function(value) {
        return Math.round(value * 100000000) / 100000000;
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