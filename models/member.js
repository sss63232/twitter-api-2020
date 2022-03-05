'use strict';
module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    RoomId: DataTypes.NUMBER,
    UserId: DataTypes.NUMBER
  }, {});
  Member.associate = function(models) {
  };
  return Member;
};