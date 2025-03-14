const OpenAI = require("openai");
const { OUTGOING_MESSAGE_TYPES } = require("./messageTypes");
const Reservation = require("../models/Reservation");
const Room = require("../models/Room");
const { Op } = require("sequelize");

// Configurare OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simulare date pentru dezvoltare
const simulatedBookingEmail = {
  from: "booking.com",
  subject: "New Reservation Request",
  body: `Guest Name: John Doe
Check-in: 2024-04-15
Check-out: 2024-04-18
Room Type: Double
Number of Guests: 2
Special Requests: None
Phone: +40722123456
Email: john.doe@email.com`
};

const simulatedWhatsAppMessage = {
  from: "+40722123456",
  message: "Bună ziua, aș dori să rezerv o cameră dublă pentru perioada 15-18 aprilie 2024, pentru 2 persoane. Numele meu este Ion Popescu și emailul este ion.popescu@email.com"
};

// Simulare răspunsuri OpenAI
const simulatedOpenAIResponses = {
  whatsappExtraction: {
    guestName: "Ion Popescu",
    startDate: "2024-04-15T00:00:00.000Z",
    endDate: "2024-04-18T00:00:00.000Z",
    roomType: "double",
    numberOfGuests: 2,
    phone: "+40722123456",
    email: "ion.popescu@email.com"
  },
  confirmationMessage: "Dragă domnule Popescu,\n\nVă mulțumim pentru rezervarea făcută! Vă confirmăm că camera dublă a fost rezervată cu succes pentru perioada 15-18 aprilie 2024.\n\nDetalii rezervare:\n- Camera: Dublă\n- Check-in: 15 aprilie 2024\n- Check-out: 18 aprilie 2024\n- Număr persoane: 2\n\nVă așteptăm cu drag!\n\nCu stimă,\nEchipa Hotelului",
  priceAnalysis: {
    proposals: [
      {
        price: 220,
        justification: "Creștere cu 10% datorită ocupării ridicate și cererii constante"
      },
      {
        price: 190,
        justification: "Reducere strategică pentru a stimula rezervările în perioadele mai puțin solicitate"
      },
      {
        price: 200,
        justification: "Menținerea prețului actual pentru a păstra competitivitatea"
      }
    ]
  }
};

// Funcție pentru procesarea automată a rezervărilor
const processAutomaticReservation = async (reservationData) => {
  try {
    // Verificăm și formatăm datele
    const startDate = new Date(reservationData.startDate);
    const endDate = new Date(reservationData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        success: false,
        message: "Format invalid pentru datele de rezervare"
      };
    }

    // 1. Mai întâi obținem toate camerele
    const allRooms = await Room.findAll({
      where: {
        type: reservationData.roomType.toLowerCase()
      },
      attributes: ["number", "type", "price"],
      order: [["number", "ASC"]]
    });

    if (!allRooms || allRooms.length === 0) {
      return {
        success: false,
        message: `Nu există camere de tip ${reservationData.roomType}`
      };
    }

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
              // Rezervarea include complet perioada cerută
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

    // 3. Creăm un set cu numerele camerelor rezervate
    const bookedRoomNumbers = new Set();
    activeReservations.forEach(reservation => {
      if (reservation.rooms && Array.isArray(reservation.rooms)) {
        reservation.rooms.forEach(room => {
          if (room && room.roomNumber && room.status !== "cancelled") {
            bookedRoomNumbers.add(room.roomNumber);
          }
        });
      }
    });

    // 4. Găsim prima cameră disponibilă
    const availableRoom = allRooms.find(room => !bookedRoomNumbers.has(room.number));

    if (!availableRoom) {
      return {
        success: false,
        message: "Nu există camere disponibile pentru perioada selectată"
      };
    }

    // Creăm rezervarea
    const reservation = await Reservation.create({
      fullName: reservationData.guestName,
      phone: reservationData.phone,
      email: reservationData.email,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: "booked",
      rooms: [{
        roomNumber: availableRoom.number,
        type: availableRoom.type,
        basePrice: availableRoom.price,
        price: availableRoom.price,
        status: "confirmed"
      }],
      notes: reservationData.specialRequests || ""
    });

    return {
      success: true,
      reservation
    };
  } catch (error) {
    console.error("❌ Eroare la procesarea automată a rezervării:", error);
    return {
      success: false,
      message: "Eroare la procesarea rezervării",
      error: error.message
    };
  }
};

// Handler pentru email-uri de la Booking.com
const handleBookingEmail = async (ws) => {
  try {
    // În producție, aici ar fi logica reală de verificare a email-urilor
    const bookingData = simulatedBookingEmail;
    
    // Parsăm datele din email
    const lines = bookingData.body.split('\n');
    const reservationData = {
      guestName: lines[0].split(': ')[1],
      startDate: lines[1].split(': ')[1],
      endDate: lines[2].split(': ')[1],
      roomType: lines[3].split(': ')[1],
      specialRequests: lines[4].split(': ')[1],
      phone: lines[5].split(': ')[1],
      email: lines[6].split(': ')[1]
    };

    // Procesăm rezervarea automat
    const result = await processAutomaticReservation(reservationData);

    if (result.success) {
      const notificationMessage = {
        type: OUTGOING_MESSAGE_TYPES.NOTIFICATION,
        title: "Rezervare automată completată",
        message: `Rezervare procesată cu succes pentru ${reservationData.guestName}`,
        reservationDetails: result.reservation,
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(notificationMessage));
    } else {
      const errorMessage = {
        type: OUTGOING_MESSAGE_TYPES.NOTIFICATION,
        title: "Rezervare automată eșuată",
        message: result.message,
        error: result.error,
        originalData: reservationData,
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(errorMessage));
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Eroare la procesarea email-ului Booking:", error);
    return { success: false, error: error.message };
  }
};

// Handler pentru mesaje WhatsApp
const handleWhatsAppMessage = async (ws) => {
  try {
    const message = simulatedWhatsAppMessage;

    // Folosim răspunsul simulat în loc de OpenAI
    const reservationData = simulatedOpenAIResponses.whatsappExtraction;
    
    // Procesăm rezervarea automat
    const result = await processAutomaticReservation(reservationData);

    if (result.success) {
      // Folosim mesajul de confirmare simulat
      const confirmationMessage = simulatedOpenAIResponses.confirmationMessage;

      const notificationMessage = {
        type: OUTGOING_MESSAGE_TYPES.NOTIFICATION,
        title: "Rezervare WhatsApp procesată",
        message: confirmationMessage,
        reservationDetails: result.reservation,
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(notificationMessage));
    } else {
      const errorMessage = {
        type: OUTGOING_MESSAGE_TYPES.NOTIFICATION,
        title: "Rezervare WhatsApp eșuată",
        message: result.message,
        error: result.error,
        originalData: reservationData,
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(errorMessage));
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Eroare la procesarea mesajului WhatsApp:", error);
    return { success: false, error: error.message };
  }
};

// Handler pentru analiza prețurilor
const handlePriceAnalysis = async (ws) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const reservations = await Reservation.findAll({
      where: {
        startDate: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      attributes: [
        'rooms',
        'startDate',
        'endDate'
      ]
    });

    // Analizăm datele pentru fiecare tip de cameră
    const roomTypeStats = {};
    reservations.forEach(reservation => {
      reservation.rooms.forEach(room => {
        if (!roomTypeStats[room.type]) {
          roomTypeStats[room.type] = {
            totalBookings: 0,
            totalRevenue: 0,
            prices: [],
            occupancyDays: new Set()
          };
        }
        
        roomTypeStats[room.type].totalBookings++;
        roomTypeStats[room.type].totalRevenue += room.price;
        roomTypeStats[room.type].prices.push(room.price);

        // Calculăm zilele de ocupare
        const start = new Date(reservation.startDate);
        const end = new Date(reservation.endDate);
        for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
          roomTypeStats[room.type].occupancyDays.add(day.toISOString().split('T')[0]);
        }
      });
    });

    // Calculăm statistici și generăm propuneri
    const proposals = await Promise.all(Object.entries(roomTypeStats).map(async ([roomType, stats]) => {
      const avgPrice = stats.totalRevenue / stats.totalBookings;
      const occupancyRate = stats.occupancyDays.size / 30;

      // Folosim analiza simulată în loc de OpenAI
      const analysis = simulatedOpenAIResponses.priceAnalysis;

      return {
        roomType,
        currentStats: {
          avgPrice: Math.round(avgPrice),
          occupancyRate: Math.round(occupancyRate * 100),
          totalBookings: stats.totalBookings
        },
        proposals: analysis.proposals
      };
    }));

    const notificationMessage = {
      type: OUTGOING_MESSAGE_TYPES.NOTIFICATION,
      title: "Propuneri de ajustare prețuri",
      message: "Sunt disponibile noi propuneri de ajustare a prețurilor",
      proposals,
      timestamp: new Date().toISOString()
    };

    ws.send(JSON.stringify(notificationMessage));
    return { success: true, data: proposals };
  } catch (error) {
    console.error("❌ Eroare la analiza prețurilor:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  handleBookingEmail,
  handleWhatsAppMessage,
  handlePriceAnalysis
}; 