const { DataTypes } = require("sequelize");
const sequelize = require("../db").sequelize;

const Room = sequelize.define("Room", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  number: { // 🔥 Numărul camerei (101, 102, etc.)
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: { // 🔥 Tipul camerei (single, dublă, etc.)
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: { // 🔥 Prețul camerei
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Room;