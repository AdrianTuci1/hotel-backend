const { analyzeMessage } = require("../nlp/nlpService");
const Room = require("../models/Room");
const Reservation = require("../models/Reservation");
const { Op } = require("sequelize");
const { 
  CHAT_INTENTS, 
  RESPONSE_TYPES 
} = require("./messageTypes");

// 🔥 Funcție pentru procesarea mesajului de chat
const handleChatMessage = async (message) => {
  try {
    console.log("📩 Mesaj primit:", message);
    const { intent, entities, extraIntents } = await analyzeMessage(message);

    let response = {
      intent,
      message: `🔹 Intent: ${intent}`,
      entities,
      extraIntents: extraIntents || [],
    };

    // 📌 Funcție pentru a obține camerele disponibile
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
          reservation.rooms.forEach(room => {
            if (room.status !== "cancelled") {
              bookedRoomNumbers.add(room.roomNumber);
            }
          });
        });

        // 4. Filtrăm camerele disponibile
        const availableRooms = allRooms.filter(room => !bookedRoomNumbers.has(room.number));

        console.log(`🔍 Verificare disponibilitate pentru perioada ${startDate} - ${endDate}:`);
        console.log(`📊 Total camere: ${allRooms.length}`);
        console.log(`🔴 Camere rezervate: ${bookedRoomNumbers.size}`);
        console.log(`✅ Camere disponibile: ${availableRooms.length}`);

        return availableRooms;
      } catch (error) {
        console.error("❌ Eroare la verificarea disponibilității camerelor:", error);
        throw error;
      }
    };

    // 📌 Rezervare nouă - Verificăm camerele disponibile
    if (intent === CHAT_INTENTS.RESERVATION) {
      const today = new Date();
      const firstDateEntry = entities.dates?.[0];

      const startDate = firstDateEntry?.startDate || today.toISOString().split("T")[0];

      let endDate;
      if (firstDateEntry?.endDate) {
        endDate = firstDateEntry.endDate;
      } else {
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        endDate = nextDay.toISOString().split("T")[0];
      }

      const availableRooms = await getAvailableRooms(startDate, endDate);

      response = {
        intent: CHAT_INTENTS.RESERVATION,
        message: `📅 Rezervare pentru ${entities.name || "N/A"} într-o cameră ${entities.roomType || "necunoscută"} de la ${startDate} până la ${endDate} (${entities.preferences || "fără preferințe"})`,
        type: RESPONSE_TYPES.OPTIONS,
        reservation: {
          guestName: entities.name || "N/A",
          roomType: entities.roomType || "necunoscută",
          startDate,
          endDate,
          preferences: entities.preferences || "fără preferințe",
          availableRooms
        },
        extraIntents: ["show_calendar"]
      };
    }

    // 📌 Modificare rezervare
    else if (intent === CHAT_INTENTS.MODIFY_RESERVATION) {
      response = {
        intent: CHAT_INTENTS.MODIFY_RESERVATION,
        message: `📅 Modificare rezervare pentru ${entities.name || "N/A"} la noua dată: ${entities.date || "dată nespecificată"}`,
        type: RESPONSE_TYPES.FORM,
        formFields: [{ name: "date", label: "Dată nouă", type: "date" }]
      };
    }

    // 📌 Anulare rezervare
    else if (intent === CHAT_INTENTS.CANCEL_RESERVATION) {
      response = {
        intent: CHAT_INTENTS.CANCEL_RESERVATION,
        message: `⚠️ Sigur dorești să anulezi rezervarea lui ${entities.name || "N/A"} pe ${entities.date || "dată nespecificată"}?`,
        type: RESPONSE_TYPES.CONFIRM
      };
    }

    console.log("📤 Răspuns trimis:", response);
    return response;
  } catch (error) {
    console.error("❌ Eroare la procesarea mesajului:", error);
    return { 
      intent: CHAT_INTENTS.UNKNOWN, 
      type: RESPONSE_TYPES.ERROR,
      message: "❌ Eroare la procesarea mesajului." 
    };
  }
};

module.exports = { handleChatMessage };