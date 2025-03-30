const { Room, Reservation } = require("../models");
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
  console.log(`🔍 Căutare camere disponibile pentru perioada: ${startDate} - ${endDate}`);
  
  try {
    // 1. Mai întâi obținem toate camerele
    const allRooms = await Room.findAll({
      attributes: ["number", "type", "price"],
      order: [["number", "ASC"]]
    });
    
    console.log(`📋 Toate camerele găsite: ${allRooms.length}`, allRooms.map(r => r.number));

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
    
    console.log(`🔖 Rezervări active găsite: ${activeReservations.length}`);
    
    // Verificăm structura rezervărilor pentru debugging
    if (activeReservations.length > 0) {
      console.log('📝 Prima rezervare:', JSON.stringify(activeReservations[0], null, 2));
    }

    // 3. Extragem numerele camerelor ocupate
    const occupiedRoomNumbers = [];
    activeReservations.forEach(reservation => {
      console.log(`🔎 Verificare rezervare ID: ${reservation.id}, Rooms:`, reservation.rooms);
      const rooms = Array.isArray(reservation.rooms) ? reservation.rooms : [];
      
      if (rooms.length === 0) {
        console.warn(`⚠️ Rezervarea ${reservation.id} nu are camere definite sau formatul este incorect`);
      }
      
      rooms.forEach(room => {
        if (!room || !room.roomNumber) {
          console.warn(`⚠️ Format incorect pentru cameră în rezervarea ${reservation.id}:`, room);
        } else {
          occupiedRoomNumbers.push(room.roomNumber);
        }
      });
    });
    
    console.log(`🚫 Camere ocupate: ${occupiedRoomNumbers.length}`, occupiedRoomNumbers);

    // 4. Filtrăm camerele disponibile
    const availableRooms = allRooms.filter(room => 
      !occupiedRoomNumbers.includes(room.number)
    );
    
    console.log(`✅ Camere disponibile: ${availableRooms.length}`, availableRooms.map(r => r.number));

    return availableRooms;
  } catch (error) {
    console.error("❌ Eroare la obținerea camerelor disponibile:", error);
    throw error;
  }
};

/**
 * Funcție pentru testarea directă a structurii rezervărilor
 * @returns {Promise<void>}
 */
const testReservationsStructure = async () => {
  try {
    console.log('🧪 Testare structură rezervări...');
    
    // Obținem toate rezervările
    const reservations = await Reservation.findAll();
    console.log(`📊 Total rezervări: ${reservations.length}`);
    
    if (reservations.length === 0) {
      console.log('⚠️ Nu există rezervări în baza de date pentru testare.');
      return;
    }
    
    // Verificăm fiecare rezervare
    reservations.forEach((reservation, index) => {
      console.log(`\n📋 Rezervare #${index + 1} (ID: ${reservation.id}):`);
      console.log(`   📆 Perioada: ${reservation.startDate} - ${reservation.endDate}`);
      console.log(`   👤 Client: ${reservation.fullName}`);
      console.log(`   🏷️ Status: ${reservation.status}`);
      
      // Verificăm structura camerelor
      console.log(`   🏨 Camere: ${typeof reservation.rooms}`);
      
      if (typeof reservation.rooms === 'string') {
        try {
          // Încercăm să parsăm dacă este un string JSON
          const roomsObj = JSON.parse(reservation.rooms);
          console.log(`   🔄 Camere (parsate din string): ${Array.isArray(roomsObj) ? 'Array' : typeof roomsObj}`);
          
          if (Array.isArray(roomsObj)) {
            roomsObj.forEach((room, i) => {
              console.log(`      🚪 Camera #${i + 1}: ${JSON.stringify(room)}`);
            });
          } else {
            console.log(`      ⚠️ Format incorect - nu este un array: ${JSON.stringify(roomsObj)}`);
          }
        } catch (e) {
          console.log(`   ❌ Eroare la parsarea JSON pentru camere: ${e.message}`);
        }
      } else if (Array.isArray(reservation.rooms)) {
        console.log(`   ✅ Rooms este un array cu ${reservation.rooms.length} elemente`);
        
        reservation.rooms.forEach((room, i) => {
          console.log(`      🚪 Camera #${i + 1}: ${JSON.stringify(room)}`);
        });
      } else {
        console.log(`   ❓ Rooms are un format necunoscut: ${JSON.stringify(reservation.rooms)}`);
      }
    });
    
    console.log('\n🧪 Test finalizat!');
  } catch (error) {
    console.error('❌ Eroare la testarea structurii rezervărilor:', error);
  }
};

module.exports = {
  getAvailableRooms,
  testReservationsStructure
}; 