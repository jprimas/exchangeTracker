'use strict';
module.exports = (sequelize, DataTypes) => {
  const Purse = sequelize.define('Purse', {
  	loginId: DataTypes.INTEGER,
    totalFees: DataTypes.FLOAT,
    totalUsdInvested: DataTypes.FLOAT,
    lastTrxDate: DataTypes.DATE
  }, {});
  Purse.associate = function(models) {
    // associations can be defined here
    models.Purse.belongsTo(models.Login);
    models.Purse.hasMany(models.Coin);
  };


  //Instance Methods
  Purse.prototype.getCoinMap = function() {
    return this.getCoins().then( coins => {
      let coinMap = {};
      for (let i = 0; i < coins.length; i++) {
        let coin = coins[i];
        coinMap[coin.symbol] = coin;
      }
      return coinMap;
    });
  }
  Purse.prototype.getDto = function() {
    return {
      totalFees: this.totalFees,
      totalUsdInvested: this.totalUsdInvested
    }
  }

  return Purse;
};