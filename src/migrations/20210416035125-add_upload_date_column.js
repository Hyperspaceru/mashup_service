'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'mashups',
        'youtubeUploadDate',
        {
          type: Sequelize.DATEONLY,
          allowNull: true
        }
      )
    ])
  },
  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('mashups','youtubeUploadDate')
    ])
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
