const { Sequelize } = require('sequelize');
const Room = require("./Room");
const Reservation = require("./Reservation");
const Stock = require("./Stock");
const Report = require("./Report");
const Invoice = require("./Invoice");
const User = require("./User");
const MessageHistory = require("./MessageHistory");

// ✅ Configurare Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite::memory:', {
  logging: false,
  dialect: process.env.DB_DIALECT || 'sqlite'
});

// ✅ Inițializare modele cu sequelize
const models = {
  Room: Room(sequelize),
  Reservation: Reservation(sequelize),
  Stock: Stock(sequelize),
  Report: Report(sequelize),
  Invoice: Invoice(sequelize),
  User: User(sequelize),
  MessageHistory: MessageHistory(sequelize)
};

// ✅ Relații între tabele
models.Room.hasMany(models.Reservation, { foreignKey: "RoomId" });
models.Reservation.belongsTo(models.Room, { foreignKey: "RoomId" });

models.Reservation.hasOne(models.Invoice, { foreignKey: "reservationId" });
models.Invoice.belongsTo(models.Reservation, { foreignKey: "reservationId" });

module.exports = { ...models, sequelize };