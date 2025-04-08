const { 
  processBookingEmail, 
  processWhatsAppMessage, 
  analyzePrices 
} = require('../services/automationService');
const { OUTGOING_MESSAGE_TYPES, NOTIFICATION_TYPES } = require('../utils/messageTypes');
const { v4: uuidv4 } = require('uuid'); // For history item IDs

/**
 * Controller pentru manipularea acțiunilor de automatizare
 */

// Helper to format notifications as HISTORY items
const formatNotificationHistory = (notificationPayload, historyId = null) => {
  return {
    type: OUTGOING_MESSAGE_TYPES.HISTORY,
    data: {
      items: [
        {
          id: historyId || uuidv4(), // Use provided ID or generate a new one
          entryType: 'notification',
          timestamp: new Date().toISOString(),
          payload: notificationPayload // The original notification object goes here
        }
      ]
    }
  };
};

// Manipulează verificarea și procesarea email-urilor de la Booking.com
const handleBookingEmail = async (ws) => {
  try {
    console.log("🔄 Manipulare verificare email-uri Booking");
    const result = await processBookingEmail(); // result structure: { result: { success, message }, data: { guestName } }
    
    const notificationPayload = {
      title: "Verificare email-uri Booking",
      message: result.result?.success 
        ? `Rezervare creată automat pentru ${result.data.guestName}` 
        : (result.result?.message || "Nu au fost găsite email-uri noi"),
      type: NOTIFICATION_TYPES.BOOKING_EMAIL, // Specific notification type
      data: result // Include the full result data from the service
    };

    const historyMessage = formatNotificationHistory(notificationPayload);
    ws.send(JSON.stringify(historyMessage)); // Changed from NOTIFICATION

  } catch (error) {
    console.error("❌ Eroare la manipularea verificării email-urilor Booking:", error);
    // Format error as HISTORY notification
    const errorPayload = {
        title: "Eroare Automatizare",
        message: "A apărut o eroare la verificarea email-urilor Booking",
        type: NOTIFICATION_TYPES.ERROR,
        data: { details: error.message }
    };
    const historyErrorMessage = formatNotificationHistory(errorPayload);
    ws.send(JSON.stringify(historyErrorMessage));
  }
};

// Manipulează verificarea și procesarea mesajelor WhatsApp
const handleWhatsAppMessage = async (ws) => {
  try {
    console.log("🔄 Manipulare procesare mesaje WhatsApp");
    const result = await processWhatsAppMessage(); // result structure includes { historyEntry, ... }

    // The automation service might have already created a history entry.
    // If so, we should send THAT entry instead of creating a new notification.
    if (result.historyEntry) {
      // Ensure the history entry from the service matches the standard format
      const historyMessage = {
        type: OUTGOING_MESSAGE_TYPES.HISTORY,
        data: {
            // Assuming result.historyEntry contains the full item structure { id, entryType, timestamp, payload }
            // If not, adapt this part to create the correct structure
            items: [result.historyEntry] 
        }
      };
       ws.send(JSON.stringify(historyMessage));
    } else {
       // If no history entry was created by the service (e.g., just an info message),
       // create a standard notification history item.
       const notificationPayload = {
          title: "Procesare Mesaj WhatsApp",
          message: result.displayMessage || "Procesare WhatsApp finalizată.", // Use display message from service
          type: NOTIFICATION_TYPES.WHATSAPP_MESSAGE,
          data: result // Include full result data
       };
       const historyMessage = formatNotificationHistory(notificationPayload);
       ws.send(JSON.stringify(historyMessage));
    }

  } catch (error) {
    console.error("❌ Eroare la manipularea procesării mesajelor WhatsApp:", error);
     const errorPayload = {
        title: "Eroare Automatizare",
        message: "A apărut o eroare la procesarea mesajelor WhatsApp",
        type: NOTIFICATION_TYPES.ERROR,
        data: { details: error.message }
    };
    const historyErrorMessage = formatNotificationHistory(errorPayload);
    ws.send(JSON.stringify(historyErrorMessage));
  }
};

// Manipulează analiza automată a prețurilor
const handlePriceAnalysis = async (ws) => {
  try {
    console.log("🔄 Manipulare analiză prețuri");
    const result = await analyzePrices(); // result structure: { analysis, roomType, currentPrice }

     const notificationPayload = {
        title: "Analiză Prețuri Camere",
        message: result.analysis?.recommendation 
            ? `Analiză prețuri finalizată. Recomandare: ${result.analysis.recommendation}`
            : "Analiza prețurilor finalizată.",
        type: NOTIFICATION_TYPES.PRICE_ANALYSIS,
        data: result // Include full result data
     };
     const historyMessage = formatNotificationHistory(notificationPayload);
     ws.send(JSON.stringify(historyMessage)); // Changed from NOTIFICATION

  } catch (error) {
    console.error("❌ Eroare la manipularea analizei prețurilor:", error);
     const errorPayload = {
        title: "Eroare Automatizare",
        message: "A apărut o eroare la analiza automată a prețurilor",
        type: NOTIFICATION_TYPES.ERROR,
        data: { details: error.message }
    };
    const historyErrorMessage = formatNotificationHistory(errorPayload);
    ws.send(JSON.stringify(historyErrorMessage));
  }
};

// Configurează și pornește verificările automate periodice
const setupAutomationChecks = (ws) => {
  console.log("⚙️ Configurare verificări automate pentru client...");
  
  // Stochează ID-urile intervalelor pentru a le putea opri la deconectare
  const intervals = {};

  // Verificare email-uri Booking la interval regulat (ex: 5 minute)
  intervals.bookingEmailInterval = setInterval(() => {
    handleBookingEmail(ws);
  }, 5 * 60 * 1000); // 5 minutes

  // Procesare mesaje WhatsApp la interval regulat (ex: 1 minut)
  intervals.whatsAppInterval = setInterval(() => {
    handleWhatsAppMessage(ws);
  }, 1 * 60 * 1000); // 1 minute

  // Analiză prețuri la interval regulat (ex: 1 oră)
  intervals.priceAnalysisInterval = setInterval(() => {
    handlePriceAnalysis(ws);
  }, 60 * 60 * 1000); // 1 hour

  console.log("✅ Verificări automate configurate.");
  return intervals;
};

module.exports = {
  handleBookingEmail,
  handleWhatsAppMessage,
  handlePriceAnalysis,
  setupAutomationChecks
}; 