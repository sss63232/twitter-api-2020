'use strict';
module.exports = (sequelize, DataTypes) => {
  const Count = sequelize.define('Count', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    usersCount: DataTypes.INTEGER,
  }, {});
  return Count;
};