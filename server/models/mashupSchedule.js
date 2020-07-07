module.exports = (sequelize, DataTypes) => {
    const mashupSchedule = sequelize.define('mashupSchedule', {
        date:{
            type: DataTypes.DATEONLY,
            primaryKey: true,
            allowNull: false
        },
        dailyQuota:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        dailyQuotaLimit:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        uploadLimitExceeded:{
            type: DataTypes.BOOLEAN,
            defaultValue:false
        }        
    })
    mashupSchedule.associate = function (models) {
        // associations can be defined here
    };
    return mashupSchedule;
}