'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Purses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      loginId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'logins', key: 'id' }
      },
      totalFees: {
        type: Sequelize.FLOAT
      },
      totalUsdInvested: {
        type: Sequelize.FLOAT
      },
      lastTrxDate: {
        type: Sequelize.DATE
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
    return queryInterface.dropTable('Purses');
  }
};