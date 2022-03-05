'use strict';
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    roomName: DataTypes.STRING
  }, {});
  Room.associate = function(models) {
    Room.hasMany(models.Message)
    Room.belongsToMany(models.User, {
      through: models.Member,
      foreignKey: 'UserId',
      as: 'RoomOfUser'
    })
  };
  return Room;
};