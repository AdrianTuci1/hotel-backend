const { DataTypes } = require("sequelize");

const Stock = (sequelize) => {
  return sequelize.define("Stock", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    category: {
      type: DataTypes.ENUM("băuturi", "alimente", "consumabile", "diverse"),
      allowNull: false,
    },
  });
};

module.exports = Stock;