const { DataTypes } = require("sequelize");
const sequelize = require("../db").sequelize;
const Reservation = require("./Reservation");

const Invoice = sequelize.define("Invoice", {
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
    references: {
      model: Reservation,
      key: "id",
    },
  },
});

module.exports = Invoice;