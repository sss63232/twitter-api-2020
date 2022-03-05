'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    UserId: DataTypes.INTEGER,
    RoomId: DataTypes.INTEGER,
    content: DataTypes.STRING,
    isRead: DataTypes.BOOLEAN
  }, {});
  Message.associate = function(models) {
    Message.belongsTo(models.User)
    Message.belongsTo(models.Room)
  };
  return Message;
};