const Room = require("../models/Room");
const Reservation = require("../models/Reservation");
const { Op } = require("sequelize");

/**
 * Funcții utilitare pentru gestionarea camerelor
 */

/**
 * Obține camerele disponibile pentru o anumită perioadă
 * @param {Date|string} startDate - Data de început
 * @param {Date|string} endDate - Data de sfârșit
 * @returns {Promise<Array>} - Array cu camerele disponibile
 */
const getAvailableRooms = async (startDate, endDate) => {
  try {
    // 1. Mai întâi obținem toate camerele
    const allRooms = await Room.findAll({
      attributes: ["number", "type", "price"],
      order: [["number", "ASC"]]
    });

    // 2. Găsim rezervările active în perioada cerută
    const activeReservations = await Reservation.findAll({
      where: {
        status: ["booked", "confirmed"],
        [Op.and]: [
          // Verificăm suprapunerea perioadelor
          {
            [Op.or]: [
              // Rezervarea începe în timpul perioadei cerute
              {
                startDate: {
                  [Op.between]: [startDate, endDate]
                }
              },
              // Rezervarea se termină în timpul perioadei cerute
              {
                endDate: {
                  [Op.between]: [startDate, endDate]
                }
              },
              // Rezervarea acoperă complet perioada cerută
              {
                [Op.and]: [
                  { startDate: { [Op.lte]: startDate } },
                  { endDate: { [Op.gte]: endDate } }
                ]
              }
            ]
          }
        ]
      }
    });

    // 3. Extragem numerele camerelor ocupate
    const occupiedRoomNumbers = [];
    activeReservations.forEach(reservation => {
      const rooms = Array.isArray(reservation.rooms) ? reservation.rooms : [];
      rooms.forEach(room => {
        occupiedRoomNumbers.push(room.roomNumber);
      });
    });

    // 4. Filtrăm camerele disponibile
    const availableRooms = allRooms.filter(room => 
      !occupiedRoomNumbers.includes(room.number)
    );

    return availableRooms;
  } catch (error) {
    console.error("❌ Eroare la obținerea camerelor disponibile:", error);
    throw error;
  }
};

module.exports = {
  getAvailableRooms
}; 