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
  return Coin;
};