const OpenAI = require("openai");
const { Room, Reservation } = require("../../models");
const { Op } = require("sequelize");
const { OUTGOING_MESSAGE_TYPES } = require("../utils/messageTypes");

/**
 * Service pentru gestionarea automatizărilor
 */

// Configurare OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Date simulate pentru dezvoltare
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
        justification: "Menținerea prețului actual, bună ocupare la acest nivel"
      }
    ],
    recommendation: "Based on occupancy rates and competitive analysis, I recommend increasing the price to 220 RON per night. This is a 10% increase from the current price of 200 RON.",
    justification: "The hotel has consistently high occupancy (85%+) at the current price point. Competitor hotels in the area are charging 230-250 RON for similar rooms. The small increase maintains competitive advantage while increasing profit margins."
  }
};

// Procesează o rezervare automată cu datele extrase
const processAutomaticReservation = async (reservationData) => {
  try {
    console.log("🤖 Procesare rezervare automată:", reservationData);
    
    // Verificăm dacă avem camerele disponibile pentru perioada solicitată
    const { startDate, endDate, roomType } = reservationData;
    
    // Obținem toate camerele de tipul specificat
    const rooms = await Room.findAll({
      where: { type: roomType },
      attributes: ["number", "type", "price"]
    });
    
    if (rooms.length === 0) {
      return {
        success: false,
        message: `Nu avem camere de tipul ${roomType} disponibile`
      };
    }

    // Verificăm rezervările existente pentru perioada solicitată
    const existingReservations = await Reservation.findAll({
      where: {
        status: ["booked", "confirmed"],
        [Op.and]: [
          {
            [Op.or]: [
              { startDate: { [Op.between]: [startDate, endDate] } },
              { endDate: { [Op.between]: [startDate, endDate] } },
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

    // Extragem camerele deja ocupate
    const occupiedRoomNumbers = [];
    existingReservations.forEach(reservation => {
      const reservedRooms = Array.isArray(reservation.rooms) ? reservation.rooms : [];
      reservedRooms.forEach(room => {
        occupiedRoomNumbers.push(room.roomNumber);
      });
    });

    // Filtrăm camerele disponibile
    const availableRooms = rooms.filter(room => 
      !occupiedRoomNumbers.includes(room.number)
    );

    if (availableRooms.length === 0) {
      return {
        success: false,
        message: `Toate camerele de tipul ${roomType} sunt ocupate în perioada solicitată`
      };
    }

    // Selectăm prima cameră disponibilă pentru rezervare
    const selectedRoom = availableRooms[0];

    // Calculăm prețul total pentru perioada solicitată
    const nights = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = selectedRoom.price * nights;

    // Creăm rezervarea
    const newReservation = await Reservation.create({
      fullName: reservationData.guestName,
      phone: reservationData.phone,
      email: reservationData.email,
      startDate,
      endDate,
      status: "confirmed",
      rooms: [{
        roomNumber: selectedRoom.number,
        type: selectedRoom.type,
        basePrice: selectedRoom.price,
        price: selectedRoom.price,
        status: "confirmed"
      }],
      isPaid: false,
      notes: "Rezervare creată automat din mesaj"
    });

    return {
      success: true,
      message: `Rezervare creată cu succes pentru ${reservationData.guestName}`,
      reservation: {
        id: newReservation.id,
        fullName: newReservation.fullName,
        startDate: newReservation.startDate,
        endDate: newReservation.endDate,
        room: selectedRoom.number,
        type: selectedRoom.type,
        price: totalPrice
      }
    };
  } catch (error) {
    console.error("❌ Eroare la procesarea rezervării automate:", error);
    return {
      success: false,
      message: `Eroare la procesarea rezervării: ${error.message}`
    };
  }
};

// Verifică și procesează email-uri de la Booking.com
const processBookingEmail = async () => {
  try {
    console.log("🔍 Verificare email-uri Booking.com...");
    
    // În mod normal, aici ar fi logica pentru citirea email-urilor
    // Pentru simulare, vom folosi datele de test
    
    // Simulăm extragerea informațiilor din email folosind AI
    const extractionPrompt = `
      Extract reservation information from the following email:
      ${simulatedBookingEmail.body}
      
      Return JSON with: guestName, startDate, endDate, roomType, numberOfGuests, phone, email
    `;
    
    // În loc să apelăm API-ul, simulăm răspunsul
    const extractedData = {
      guestName: "John Doe",
      startDate: "2024-04-15T00:00:00.000Z",
      endDate: "2024-04-18T00:00:00.000Z",
      roomType: "double",
      numberOfGuests: 2,
      phone: "+40722123456",
      email: "john.doe@email.com"
    };
    
    // Procesăm rezervarea automată
    const result = await processAutomaticReservation(extractedData);
    
    return {
      type: "booking_email",
      data: extractedData,
      result
    };
  } catch (error) {
    console.error("❌ Eroare la procesarea email-ului Booking:", error);
    return {
      type: "booking_email",
      error: error.message
    };
  }
};

// Verifică și procesează mesaje WhatsApp
const processWhatsAppMessage = async () => {
  try {
    console.log("🔍 Verificare mesaje WhatsApp...");
    
    // În mod normal, aici ar fi logica pentru citirea mesajelor WhatsApp
    // Pentru simulare, vom folosi datele de test
    
    // Simulăm extragerea informațiilor din mesajul WhatsApp folosind AI
    const extractionPrompt = `
      Extract reservation information from the following WhatsApp message:
      ${simulatedWhatsAppMessage.message}
      
      Return JSON with: guestName, startDate, endDate, roomType, numberOfGuests, phone, email
    `;
    
    // În loc să apelăm API-ul, simulăm răspunsul
    const extractedData = simulatedOpenAIResponses.whatsappExtraction;
    
    // Procesăm rezervarea automată
    const result = await processAutomaticReservation(extractedData);
    
    // Generăm mesajul de confirmare pentru client
    const confirmationMessage = simulatedOpenAIResponses.confirmationMessage;
    
    // Adăugăm în istoric
    const historyEntry = {
      type: "whatsapp_message",
      action: result.success ? "reservation_created" : "reservation_failed",
      content: {
        guestName: extractedData.guestName,
        roomNumber: result.reservation?.room,
        startDate: extractedData.startDate,
        endDate: extractedData.endDate,
        success: result.success,
        message: result.message
      },
      metadata: {
        phone: extractedData.phone,
        email: extractedData.email,
        lastMessages: [
          simulatedWhatsAppMessage.message,
          "Mesaj anterior 1",
          "Mesaj anterior 2"
        ]
      },
      createdAt: new Date()
    };

    // Adăugăm în istoric (aici ar trebui să folosim un serviciu de istoric)
    // await addToHistory(historyEntry);
    
    return {
      type: "whatsapp_message",
      data: extractedData,
      result,
      confirmationMessage,
      historyEntry,
      displayMessage: result.success 
        ? `Am încheiat cu succes o rezervare în data de ${new Date().toLocaleDateString()} la camera ${result.reservation?.room}`
        : "Aveți o solicitare pe WhatsApp care necesită intervenția dumneavoastră.",
      requiresIntervention: !result.success,
      lastMessages: historyEntry.metadata.lastMessages
    };
  } catch (error) {
    console.error("❌ Eroare la procesarea mesajului WhatsApp:", error);
    return {
      type: "whatsapp_message",
      error: error.message,
      displayMessage: "Aveți o solicitare pe WhatsApp care necesită intervenția dumneavoastră.",
      requiresIntervention: true
    };
  }
};

// Analizează prețurile și face recomandări
const analyzePrices = async () => {
  try {
    console.log("📊 Analizare prețuri...");
    
    // Obținem date despre ocuparea hotelului și prețuri
    const rooms = await Room.findAll();
    const reservations = await Reservation.findAll({
      where: {
        startDate: {
          [Op.gte]: new Date()
        }
      }
    });
    
    // În mod normal, aici ar fi logica pentru analiza datelor
    // Pentru simulare, vom folosi datele de test
    
    // Simulăm recomandări AI pentru prețuri
    const priceAnalysisPrompt = `
      Analyze hotel occupancy rates and make price recommendations based on:
      - Current occupancy: 85%
      - Current average price: 200 RON
      - Competitor prices: Range from 190 to 250 RON
      - Upcoming events in the area: 1 major conference
      
      Provide recommendations for pricing adjustments.
    `;
    
    // În loc să apelăm API-ul, simulăm răspunsul
    const analysis = simulatedOpenAIResponses.priceAnalysis;
    
    return {
      type: "price_analysis",
      currentOccupancy: "85%",
      currentAveragePrice: "200 RON",
      competitorPrices: "190-250 RON",
      analysis
    };
  } catch (error) {
    console.error("❌ Eroare la analiza prețurilor:", error);
    return {
      type: "price_analysis",
      error: error.message
    };
  }
};

module.exports = {
  processBookingEmail,
  processWhatsAppMessage,
  analyzePrices,
  processAutomaticReservation
}; 