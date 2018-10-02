const {CommonUtil} = require('../utils/CommonUtil');

module.exports = (sequelize, DataTypes) => {
  const Coin = sequelize.define('Coin', {
    purseId: DataTypes.INTEGER,
    symbol: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    totalPurchasePrice: DataTypes.FLOAT
  }, {});
  Coin.associate = function(models) {
    // associations can be defined here
    models.Coin.belongsTo(models.Purse, {foreignKey: 'purseId'});
  };

  //Instance Methods
  Coin.prototype.getDto = function() {
    return {
      symbol: this.symbol,
      amount: CommonUtil.formatWithEightDecimals(this.amount),
      totalPurchasePrice: CommonUtil.formatWithTwoDecimals(this.totalPurchasePrice)
    }
  }


  return Coin;
};