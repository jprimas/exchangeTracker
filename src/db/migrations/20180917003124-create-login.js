module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Logins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      binanceApiKey: {
        type: Sequelize.STRING
      },
      binanceApiSecret: {
        type: Sequelize.STRING
      },
      gdaxApiKey: {
        type: Sequelize.STRING
      },
      gdaxApiSecret: {
        type: Sequelize.STRING
      },
      gdaxApiPassphrase: {
        type: Sequelize.STRING
      },
      coinbaseApiKey: {
        type: Sequelize.STRING
      },
      coinbaseApiSecret: {
        type: Sequelize.STRING
      },
      taxYear: {
        type: Sequelize.INTEGER
      },
      netIncome: {
        type: Sequelize.FLOAT
      },
      shortTermCapitalGains: {
        type: Sequelize.FLOAT
      },
      longTermCapitalGains: {
        type: Sequelize.FLOAT
      },
      shortTermCapitalLosses: {
        type: Sequelize.FLOAT
      },
      longTermCapitalLosses: {
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Logins');
  }
};