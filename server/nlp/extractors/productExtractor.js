const { Stock } = require("../../models");

// Lista de scurtături pentru produse
const productShortcuts = {
  'cola': 'Coca Cola',
  'cafea': 'Cafea',
  'apa': 'Apa minerala Borsec',
  'apa pl': 'Apa plata',
  'apa min': 'Apa minerala',
  'schweps': 'Schweppes Mandarin',
  'fanta': 'Fanta',
  'sprite': 'Sprite',
  'redbull': 'Red Bull',
  'monster': 'Monster Energy'
};

const normalizeText = (text) => {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const extractProductWithQuantity = (message) => {
  const normalizedMessage = normalizeText(message);
  const products = [];

  // Pattern pentru a găsi cantități și produse
  const quantityPattern = /\b(\d+)\s+([a-zA-ZăâîșțĂÂÎȘȚ]+(?:\s+[a-zA-ZăâîșțĂÂÎȘȚ]+)*)\b/i;

  let match;
  while ((match = quantityPattern.exec(normalizedMessage)) !== null) {
    const quantity = parseInt(match[1]);
    const productText = match[2].toLowerCase().trim();
    
    // Verificăm dacă este o scurtătură
    const fullProductName = productShortcuts[productText] || productText;
    
    products.push({
      quantity,
      productName: fullProductName
    });
  }

  return products;
};

const extractItem = async (message) => {
  const normalizedMessage = normalizeText(message);
  
  // Obținem toate elementele din stoc
  const items = await Stock.findAll({
    attributes: ['name']
  });

  // Creăm un regex din numele elementelor
  const itemNames = items.map(item => item.name.toLowerCase());
  const itemRegex = new RegExp(`\\b(${itemNames.join('|')})\\b`, 'i');
  
  const match = normalizedMessage.match(itemRegex);
  if (match) {
    return match[0].toLowerCase();
  }
  return null;
};

module.exports = {
  extractProductWithQuantity,
  extractItem,
  productShortcuts
}; 