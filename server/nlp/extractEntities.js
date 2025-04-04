const {
  dateExtractor,
  productExtractor,
  roomExtractor,
  contactExtractor,
  intentExtractor
} = require('./extractors');

const extractEntities = async (message) => {
  // Mai întâi încercăm să extragem intentia și entitățile bazate pe pattern-ul comenzii
  const intentResult = intentExtractor.extractIntent(message);
  if (intentResult) {
    const { intent, entities } = intentResult;
    
    // Procesăm entitățile în funcție de intent
    switch (intent) {
      case 'rezervare':
        // Procesăm datele pentru rezervare
        const dates = dateExtractor.extractDates(entities.dates);
        if (dates.length > 0) {
          entities.dates = dates;
        }
        break;
        
      case 'vanzare':
        // Procesăm produsele pentru vânzare
        const products = productExtractor.extractProductWithQuantity(entities.products);
        if (products.length > 0) {
          entities.products = products;
        }
        break;
        
      case 'tel':
        // Procesăm data pentru telefon
        const phoneDate = dateExtractor.extractDates(entities.date);
        if (phoneDate.length > 0) {
          entities.date = phoneDate[0];
        }
        break;
        
      case 'problema':
        // Nu mai avem nevoie de procesare suplimentară
        break;
        
      case 'adauga camera':
        // Nu mai avem nevoie de procesare suplimentară
        break;
    }
    
    return entities;
  }

  // Dacă nu am găsit un pattern de comandă, încercăm să extragem entități generale
  let entities = {};

  // Extragem datele
  const extractedDates = dateExtractor.extractDates(message);
  if (extractedDates.length > 0) entities.dates = extractedDates;

  // Extragem tipul camerei
  const roomType = roomExtractor.extractRoomType(message);
  if (roomType) entities.roomType = roomType;

  // Extragem numele folosind tipul camerei pentru context
  const name = contactExtractor.extractName(message, entities.roomType);
  if (name) entities.name = name;

  // Extragem preferințele
  const preferences = roomExtractor.extractRoomPreferences(message);
  if (preferences) entities.preferences = preferences;

  // Extragem numărul camerei
  const roomNumber = roomExtractor.extractRoomNumber(message);
  if (roomNumber) entities.roomNumber = roomNumber;

  // Extragem numărul de telefon
  const phoneNumber = contactExtractor.extractPhoneNumber(message);
  if (phoneNumber) entities.phoneNumber = phoneNumber;
  
  // Extragem descrierea problemei
  const problemDescription = roomExtractor.extractRoomProblem(message);
  if (problemDescription) entities.problemDescription = problemDescription;

  // Extragem elementul din stoc
  const item = await productExtractor.extractItem(message);
  if (item) entities.item = item;

  return entities;
};

module.exports = extractEntities;