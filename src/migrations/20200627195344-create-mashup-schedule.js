'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('mashupSchedules', {
      date: {
        type: Sequelize.DATEONLY,
        primaryKey: true,
        allowNull: false
      },
      dailyQuota: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      dailyQuotaLimit: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      uploadLimitExceeded: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    return queryInterface.dropTable('mashupSchedules');
  }
};