CommonUtil = {
    formatAsPercentage: function(value) {
        return ((value - 1) * 100).toFixed(2);
    }
}

module.exports = CommonUtil;