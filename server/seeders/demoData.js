const { sequelize } = require("../db");
const Room = require("../models/Room");
const Reservation = require("../models/Reservation");

const seedDatabase = async () => {
  try {
    console.log("⏳ Seeding bazei de date...");

    await sequelize.authenticate();
    console.log("✅ Conectat la baza de date!");

    await sequelize.sync({ force: true }); // ✅ Resetăm și recreăm tabelele

    // 📌 Adăugăm camere demo
    await Room.bulkCreate([
      { number: "101", type: "single", price: 200 },
      { number: "102", type: "dubla", price: 350 },
      { number: "103", type: "twin", price: 300 },
      { number: "104", type: "apartament", price: 500 },
      { number: "105", type: "single", price: 210 },
      { number: "106", type: "dubla", price: 360 },
      { number: "107", type: "twin", price: 320 },
      { number: "108", type: "apartament", price: 550 },
      { number: "201", type: "single", price: 220 },
      { number: "202", type: "dubla", price: 380 },
      { number: "203", type: "twin", price: 340 },
      { number: "204", type: "apartament", price: 600 },
      { number: "205", type: "single", price: 230 },
      { number: "206", type: "dubla", price: 390 },
      { number: "207", type: "twin", price: 350 },
      { number: "208", type: "apartament", price: 650 }
    ]);

    // 📌 Funcție pentru generarea de date dinamice
    const getDate = (offset = 0) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return date.toISOString().split("T")[0];
    };

    // 📌 Adăugăm rezervări demo
    await Reservation.bulkCreate([
      {
        fullName: "Mihai Popescu",
        phone: "+40722123456",
        email: "mihai.popescu@email.com",
        startDate: getDate(0),
        endDate: getDate(2),
        status: "booked",
        isPaid: false,
        notes: "Preferă etajul 1, pat suplimentar pentru copil",
        rooms: [
          {
            roomNumber: "102",
            type: "dubla",
            basePrice: 350,
            price: 380, // preț special cu pat suplimentar
            startDate: getDate(0),
            endDate: getDate(2),
            status: "confirmed"
          }
        ]
      },
      {
        fullName: "Ana Ionescu",
        phone: "+40733123456",
        email: "ana.ionescu@email.com",
        startDate: getDate(1),
        endDate: getDate(5),
        status: "confirmed",
        isPaid: true,
        hasInvoice: true,
        notes: "Client fidel, solicită mic dejun în cameră",
        rooms: [
          {
            roomNumber: "204",
            type: "apartament",
            basePrice: 600,
            price: 650, // preț cu servicii extra
            startDate: getDate(1),
            endDate: getDate(5),
            status: "confirmed"
          },
          {
            roomNumber: "205",
            type: "single",
            basePrice: 230,
            price: 230,
            startDate: getDate(1),
            endDate: getDate(5),
            status: "confirmed"
          }
        ]
      },
      {
        fullName: "Elena Dumitru",
        phone: "+40744123456",
        email: "elena.dumitru@email.com",
        startDate: getDate(0),
        endDate: getDate(1),
        status: "confirmed",
        isPaid: true,
        hasInvoice: true,
        hasReceipt: true,
        rooms: [
          {
            roomNumber: "101",
            type: "single",
            basePrice: 200,
            price: 200,
            startDate: getDate(0),
            endDate: getDate(1),
            status: "confirmed"
          }
        ]
      },
      {
        fullName: "George Constantinescu",
        phone: "+40755123456",
        email: "george.const@email.com",
        startDate: getDate(3),
        endDate: getDate(7),
        status: "booked",
        isPaid: false,
        notes: "Grup business, necesită sală de conferințe",
        rooms: [
          {
            roomNumber: "206",
            type: "dubla",
            basePrice: 390,
            price: 390,
            startDate: getDate(3),
            endDate: getDate(7),
            status: "confirmed"
          },
          {
            roomNumber: "207",
            type: "twin",
            basePrice: 350,
            price: 350,
            startDate: getDate(3),
            endDate: getDate(7),
            status: "confirmed"
          },
          {
            roomNumber: "208",
            type: "apartament",
            basePrice: 650,
            price: 700, // preț cu facilități business
            startDate: getDate(3),
            endDate: getDate(7),
            status: "confirmed"
          }
        ]
      },
      {
        fullName: "Maria Stanescu",
        phone: "+40766123456",
        email: "maria.stanescu@email.com",
        startDate: getDate(2),
        endDate: getDate(4),
        status: "booked",
        isPaid: true,
        hasInvoice: true,
        notes: "Aniversare căsătorie, solicită decorare cameră",
        rooms: [
          {
            roomNumber: "104",
            type: "apartament",
            basePrice: 500,
            price: 600, // preț cu servicii speciale
            startDate: getDate(2),
            endDate: getDate(4),
            status: "confirmed"
          }
        ]
      },
      {
        fullName: "Adrian Petrescu",
        phone: "+40777123456",
        email: "adrian.petrescu@email.com",
        existingClientId: 12345,
        startDate: getDate(5),
        endDate: getDate(10),
        status: "booked",
        isPaid: true,
        hasInvoice: true,
        notes: "Client regular, preferă camera 203",
        rooms: [
          {
            roomNumber: "203",
            type: "twin",
            basePrice: 340,
            price: 320, // discount client fidel
            startDate: getDate(5),
            endDate: getDate(10),
            status: "confirmed"
          }
        ]
      },
      {
        fullName: "Cristina Dobre",
        phone: "+40788123456",
        email: "cristina.dobre@email.com",
        startDate: getDate(4),
        endDate: getDate(6),
        status: "booked",
        isPaid: false,
        notes: "Check-in târziu, după ora 22:00",
        rooms: [
          {
            roomNumber: "201",
            type: "single",
            basePrice: 220,
            price: 220,
            startDate: getDate(4),
            endDate: getDate(6),
            status: "confirmed"
          }
        ]
      },
      {
        fullName: "Daniel Munteanu",
        phone: "+40799123456",
        email: "daniel.munteanu@email.com",
        startDate: getDate(6),
        endDate: getDate(8),
        status: "booked",
        isPaid: true,
        hasInvoice: true,
        hasReceipt: true,
        notes: "Rezervare corporate, cu factură pe firmă",
        rooms: [
          {
            roomNumber: "202",
            type: "dubla",
            basePrice: 380,
            price: 380,
            startDate: getDate(6),
            endDate: getDate(8),
            status: "confirmed"
          },
          {
            roomNumber: "203",
            type: "twin",
            basePrice: 340,
            price: 340,
            startDate: getDate(6),
            endDate: getDate(8),
            status: "confirmed"
          }
        ]
      }
    ]);

    console.log("✅ Baza de date a fost populată cu rezervări demo!");
  } catch (error) {
    console.error("❌ Eroare la popularea bazei de date:", error);
  } finally {
    await sequelize.close();
    process.exit();
  }
};

// ✅ Exportăm funcția pentru a putea fi apelată manual sau automat
module.exports = seedDatabase;

// 🔥 Dacă fișierul este rulat direct cu `node`, executăm funcția
if (require.main === module) {
  seedDatabase();
}