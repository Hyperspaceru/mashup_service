module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('mashups', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      }
      ,
      groupId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      postLink: {
        type: Sequelize.STRING,
        allowNull: false
      },
      author: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      imagePath: {
        type: Sequelize.STRING
      },
      audioPath: {
        type: Sequelize.STRING
      },
      videoPath: {
        type: Sequelize.STRING
      },
      youtubeLink: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.TEXT
      },
      approve: {
        type: Sequelize.BOOLEAN
      },
      uploadFirst: {
        type: Sequelize.BOOLEAN
      },
      postDate: {
        type: Sequelize.DATE
      },
      likes: {
        type: Sequelize.BOOLEAN
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
    return queryInterface.dropTable('mashups');
  }
};