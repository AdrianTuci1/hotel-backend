const { DataTypes } = require("sequelize");

const Invoice = (sequelize) => {
  return sequelize.define("Invoice", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    guestName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("card", "cash", "transfer bancar"),
      allowNull: false,
    },
    reservationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });
};

module.exports = Invoice;