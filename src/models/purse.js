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
  return Purse;
};