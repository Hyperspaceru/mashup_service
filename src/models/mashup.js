
module.exports = (sequelize, DataTypes) => {
  const mashup = sequelize.define('mashup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    publicId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    postLink: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    imageExt: {
      type: DataTypes.STRING
    },
    imagePath: {
      type: DataTypes.STRING
    },
    audioPath: {
      type: DataTypes.STRING
    },
    videoPath: {
      type: DataTypes.STRING
    },
    youtubeLink: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.TEXT
    },
    approve: {
      type: DataTypes.BOOLEAN
    },
    uploadFirst: {
      type: DataTypes.BOOLEAN
    },
    postDate: {
      type: DataTypes.DATE
    },
    likes: {
      type: DataTypes.INTEGER
    },
    youtubeUploadDate:{
      type: DataTypes.DATEONLY
    }
  }, {});
  mashup.associate = function(models) {
    // associations can be defined here
  };
  return mashup;
};