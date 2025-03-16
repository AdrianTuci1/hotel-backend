const { 
  processBookingEmail, 
  processWhatsAppMessage, 
  analyzePrices 
} = require('../services/automationService');
const { OUTGOING_MESSAGE_TYPES, AUTOMATION_ACTIONS } = require('../utils/messageTypes');

/**
 * Controller pentru manipularea acțiunilor de automatizare
 */

// Manipulează verificarea și procesarea email-urilor de la Booking.com
const handleBookingEmail = async (ws) => {
  try {
    console.log("🔄 Manipulare verificare email-uri Booking");
    const result = await processBookingEmail();
    
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.NOTIFICATION,
      notification: {
        title: "Verificare email-uri Booking",
        message: result.result?.success 
          ? `Rezervare creată automat pentru ${result.data.guestName}` 
          : (result.result?.message || "Nu au fost găsite email-uri noi"),
        type: "booking_email",
        data: result
      }
    }));
  } catch (error) {
    console.error("❌ Eroare la manipularea verificării email-urilor Booking:", error);
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.ERROR,
      message: "A apărut o eroare la verificarea email-urilor Booking"
    }));
  }
};

// Manipulează verificarea și procesarea mesajelor WhatsApp
const handleWhatsAppMessage = async (ws) => {
  try {
    console.log("🔄 Manipulare verificare mesaje WhatsApp");
    const result = await processWhatsAppMessage();
    
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.NOTIFICATION,
      notification: {
        title: "Verificare mesaje WhatsApp",
        message: result.result?.success 
          ? `Rezervare creată automat pentru ${result.data.guestName}` 
          : (result.result?.message || "Nu au fost găsite mesaje noi"),
        type: "whatsapp_message",
        data: result
      }
    }));
  } catch (error) {
    console.error("❌ Eroare la manipularea verificării mesajelor WhatsApp:", error);
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.ERROR,
      message: "A apărut o eroare la verificarea mesajelor WhatsApp"
    }));
  }
};

// Manipulează analiza prețurilor
const handlePriceAnalysis = async (ws) => {
  try {
    console.log("🔄 Manipulare analiză prețuri");
    const result = await analyzePrices();
    
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.NOTIFICATION,
      notification: {
        title: "Analiză prețuri",
        message: `Recomandare: ${result.analysis.recommendation}`,
        type: "price_analysis",
        data: result
      }
    }));
  } catch (error) {
    console.error("❌ Eroare la manipularea analizei prețurilor:", error);
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.ERROR,
      message: "A apărut o eroare la analiza prețurilor"
    }));
  }
};

// Procesează acțiunile de automatizare
const handleAutomationAction = async (ws, action) => {
  try {
    console.log(`🤖 Procesare acțiune automatizare: ${action}`);
    
    switch (action) {
      case AUTOMATION_ACTIONS.BOOKING_EMAIL:
        await handleBookingEmail(ws);
        break;
        
      case AUTOMATION_ACTIONS.WHATSAPP_MESSAGE:
        await handleWhatsAppMessage(ws);
        break;
        
      case AUTOMATION_ACTIONS.PRICE_ANALYSIS:
        await handlePriceAnalysis(ws);
        break;
        
      default:
        throw new Error(`Acțiune automatizare necunoscută: ${action}`);
    }
  } catch (error) {
    console.error(`❌ Eroare la procesarea acțiunii automatizare ${action}:`, error);
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.ERROR,
      message: `Eroare la procesarea acțiunii automatizare: ${error.message}`
    }));
  }
};

// Configurează verificările periodice pentru automatizări
const setupAutomationChecks = (ws) => {
  console.log("⏰ Configurare verificări automate periodice");

  // Verificare email-uri Booking.com la fiecare 5 minute
  const bookingEmailInterval = setInterval(() => {
    handleBookingEmail(ws);
  }, 5 * 60 * 1000);

  // Verificare mesaje WhatsApp la fiecare 2 minute
  const whatsAppInterval = setInterval(() => {
    handleWhatsAppMessage(ws);
  }, 2 * 60 * 1000);

  // Analiză prețuri zilnică
  const priceAnalysisInterval = setInterval(() => {
    handlePriceAnalysis(ws);
  }, 24 * 60 * 60 * 1000);

  // Returnăm intervallele pentru a putea fi oprite dacă e nevoie
  return {
    bookingEmailInterval,
    whatsAppInterval,
    priceAnalysisInterval
  };
};

module.exports = {
  handleBookingEmail,
  handleWhatsAppMessage,
  handlePriceAnalysis,
  handleAutomationAction,
  setupAutomationChecks
}; 