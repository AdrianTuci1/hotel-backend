const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");

/**
 * Handler pentru intenția de vânzare a unui produs
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleSellProductIntent = (entities, extraIntents = [], sendResponse) => {
  console.log('🛒 Handler vânzare produs apelat cu entități:', entities);
  
  if (!entities.productName) {
    sendResponse({
      intent: CHAT_INTENTS.SELL_PRODUCT,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici ce produs dorești să vinzi.",
      extraIntents: extraIntents || [],
      reservation: null
    });
    return;
  }

  const productName = entities.productName.value;
  const quantity = entities.quantity?.value || 1;
  
  // Procesăm datele și construim răspunsul
  const response = {
    intent: CHAT_INTENTS.SELL_PRODUCT,
    type: RESPONSE_TYPES.ACTION,
    message: `Se deschide modulul POS pentru vânzarea produsului ${productName} (cantitate: ${quantity}).`,
    extraIntents: extraIntents || [],
    reservation: null,
    // Adăugăm informații specifice pentru POS
    pos: {
      productName,
      quantity
    }
  };
  
  // Trimitem răspunsul prin callback
  sendResponse(response);
};

module.exports = {
  handleSellProductIntent
}; 