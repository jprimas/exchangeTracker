'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login = sequelize.define('Login', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    salt: DataTypes.STRING,
    binanceApiKey: DataTypes.STRING,
    binanceApiSecret: DataTypes.STRING,
    gdaxApiKey: DataTypes.STRING,
    gdaxApiSecret: DataTypes.STRING,
    gdaxApiPassphrase: DataTypes.STRING,
    coinbaseApiKey: DataTypes.STRING,
    coinbaseApiSecret: DataTypes.STRING
  }, {});
  Login.associate = function(models) {
    // associations can be defined here
    models.Login.hasOne(models.Purse, {foreignKey: 'loginId'});
  };
  return Login;
};