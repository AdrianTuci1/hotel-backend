const { CHAT_INTENTS /*, RESPONSE_TYPES */ } = require("../utils/messageTypes");
const {
  sendOpenPosForSale,
  sendErrorResponse
} = require('../utils/uiResponder');

/**
 * Helper function to extract entity values.
 * @param {Object} entities - The extracted entities object.
 * @returns {Object} An object containing extracted values (productName, quantity).
 */
const getEntityValues = (entities) => ({
    productName: entities.product?.values[0]?.value || entities.productName?.values[0]?.value,
    quantity: entities.quantity?.values[0]?.value
});

/**
 * Handler pentru intenția de vânzare a unui produs
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleSellProductIntent = (entities, sendResponse) => {
  console.log('🛒 Handler vânzare produs apelat cu entități:', entities);
  
  const { productName, quantity } = getEntityValues(entities);

  if (!productName) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.SELL_PRODUCT, "Te rog să specifici ce produs dorești să vinzi.");
    return;
  }

  const posData = {
      productName: String(productName),
      quantity: quantity ? parseInt(quantity, 10) : 1 // Default to 1 if not specified
  };

  if (isNaN(posData.quantity) || posData.quantity <= 0) {
    posData.quantity = 1; // Ensure quantity is a positive integer
  }

  // Trimitem răspunsul prin callback centralizat
  sendOpenPosForSale(sendResponse, posData);
};

module.exports = {
  handleSellProductIntent
}; 