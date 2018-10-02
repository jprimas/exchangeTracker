'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login = sequelize.define('Login', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    binanceApiKey: DataTypes.STRING,
    binanceApiSecret: DataTypes.STRING,
    gdaxApiKey: DataTypes.STRING,
    gdaxApiSecret: DataTypes.STRING,
    gdaxApiPassphrase: DataTypes.STRING,
    coinbaseApiKey: DataTypes.STRING,
    coinbaseApiSecret: DataTypes.STRING,
    taxYear: DataTypes.INTEGER,
    netIncome: DataTypes.FLOAT,
    shortTermCapitalGains: DataTypes.FLOAT,
    longTermCapitalGains: DataTypes.FLOAT,
    shortTermCapitalLosses: DataTypes.FLOAT,
    longTermCapitalLosses: DataTypes.FLOAT
  }, {});
  Login.associate = function(models) {
    // associations can be defined here
    models.Login.hasOne(models.Purse, {foreignKey: 'loginId'});
  };
  return Login;
};