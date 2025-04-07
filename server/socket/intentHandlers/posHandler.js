const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const {
  sendOpenPosForSale,
  sendErrorResponse
} = require('../utils/uiResponder');

/**
 * Handler pentru intenția de vânzare a unui produs
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleSellProductIntent = (entities, sendResponse) => {
  console.log('🛒 Handler vânzare produs apelat cu entități:', entities);
  
  if (!entities.productName) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.SELL_PRODUCT, "Te rog să specifici ce produs dorești să vinzi.");
    return;
  }

  const productName = typeof entities.productName === 'object' ? entities.productName.value : entities.productName;
  const quantity = entities.quantity?.value || 1;
  
  const posData = {
      productName,
      quantity
  };

  // Trimitem răspunsul prin callback centralizat
  sendOpenPosForSale(sendResponse, posData);
};

module.exports = {
  handleSellProductIntent
}; 