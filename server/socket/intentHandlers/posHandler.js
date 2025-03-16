const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");

/**
 * Handler pentru intenția de vânzare a produselor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Object} - Răspunsul formatat
 */
const handleSellProductIntent = (entities, extraIntents = []) => {
  let response = {
    intent: CHAT_INTENTS.SELL_PRODUCT,
    entities,
    extraIntents: extraIntents || [],
  };

  // Verificăm dacă avem datele necesare pentru vânzare
  if (entities.productName || entities.productId) {
    const productInfo = entities.productName || entities.productId;
    const quantity = entities.quantity || 1;
    const roomNumber = entities.roomNumber;
    
    // În loc să efectuăm acțiunea, returnăm datele pentru frontend
    response.type = RESPONSE_TYPES.POS;
    response.title = "Vânzare produs";
    response.message = `Pregătit pentru a vinde ${quantity} x ${productInfo}${roomNumber ? ` pentru camera ${roomNumber}` : ''}.`;
    response.sale = {
      productIdentifier: entities.productId || entities.productName,
      quantity: quantity,
      roomNumber: roomNumber || null,
      customerName: entities.customerName || null,
      useRoomBill: !!roomNumber
    };
  } 

  return response;
};

module.exports = {
  handleSellProductIntent
}; 