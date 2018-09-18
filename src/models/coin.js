'use strict';
module.exports = (sequelize, DataTypes) => {
  const Coin = sequelize.define('Coin', {
    purseId: DataTypes.INTEGER,
    symbol: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    totalPurchasePrice: DataTypes.FLOAT
  }, {});
  Coin.associate = function(models) {
    // associations can be defined here
    models.Coin.belongsTo(models.Purse);
  };

  //Instance Methods
  Coin.prototype.getDto = function() {
    return {
      symbol: this.symbol,
      amount: this.amount,
      totalPurchasePrice: this.totalPurchasePrice
    }
  }


  return Coin;
};