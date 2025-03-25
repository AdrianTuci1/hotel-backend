const { DataTypes } = require("sequelize");
const sequelize = require("../db").sequelize;

const RoomStatus = sequelize.define("RoomStatus", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  isClean: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  hasProblems: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  problem: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = RoomStatus; 