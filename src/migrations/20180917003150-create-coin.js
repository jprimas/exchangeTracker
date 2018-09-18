'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Coins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      purseId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'purses', key: 'id' }
      },
      symbol: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.FLOAT
      },
      totalPurchasePrice: {
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
    return queryInterface.dropTable('Coins');
  }
};