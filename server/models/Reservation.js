const { DataTypes } = require("sequelize");
const sequelize = require("../db").sequelize;

const Reservation = sequelize.define("Reservation", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  existingClientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("booked", "confirmed"),
    defaultValue: "booked",
  },
  rooms: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidRoomsArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Rooms must be an array');
        }
        value.forEach(room => {
          if (!room.roomNumber || !room.type || !room.basePrice || !room.price) {
            throw new Error('Each room must have roomNumber, type, basePrice, and price');
          }
        });
      }
    }
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hasInvoice: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hasReceipt: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
});

module.exports = Reservation;