const Room = require("./Room");
const Reservation = require("./Reservation");
const Stock = require("./Stock");
const Report = require("./Report");
const Invoice = require("./Invoice");
const User = require("./User");

// ✅ Relații între tabele
Room.hasMany(Reservation, { foreignKey: "RoomId" });
Reservation.belongsTo(Room, { foreignKey: "RoomId" });

Reservation.hasOne(Invoice, { foreignKey: "reservationId" });
Invoice.belongsTo(Reservation, { foreignKey: "reservationId" });

module.exports = { Room, Reservation, Stock, Report, Invoice, User };