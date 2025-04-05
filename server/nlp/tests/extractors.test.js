const { extractEntities } = require('../extractors');
const { CHAT_INTENTS } = require('../../socket/utils/messageTypes');

// Curăță cache-ul între teste
beforeEach(() => {
  // Resetăm cache-ul pentru fiecare test
  jest.clearAllMocks();
});

describe('Entity Extraction Tests', () => {
  describe('Reservation Intent', () => {
    test('should extract name, room type and dates from reservation message', () => {
      const message = 'rezervare Andrei Anton dubla 16-18 apr';
      const result = extractEntities(message, CHAT_INTENTS.RESERVATION);
      expect(result).toEqual({
        fullName: 'Andrei Anton',
        roomType: 'dubla',
        startDate: '2024-04-16',
        endDate: '2024-04-18'
      });
    });
  });

  describe('Add Room Intent', () => {
    test('should extract room number, type and price', () => {
      const message = 'adauga camera c301 twin 600 lei';
      const result = extractEntities(message, CHAT_INTENTS.ADD_ROOM);
      expect(result).toEqual({
        roomNumber: 'c301',
        roomType: 'twin',
        price: 600
      });
    });

    test('should extract only room number and type', () => {
      const message = 'adauga camera c301 twin';
      const result = extractEntities(message, CHAT_INTENTS.ADD_ROOM);
      expect(result).toEqual({
        roomNumber: 'c301',
        roomType: 'twin'
      });
    });
  });

  describe('Add Product Intent', () => {
    test('should extract product name and quantity', () => {
      const message = 'adauga produs apa plata 5 buc';
      const result = extractEntities(message, CHAT_INTENTS.ADD_PRODUCT);
      expect(result).toEqual({
        productName: 'apa plata',
        quantity: 5
      });
    });

    test('should extract only product name', () => {
      const message = 'adauga apa plata';
      const result = extractEntities(message, CHAT_INTENTS.ADD_PRODUCT);
      expect(result).toEqual({
        productName: 'apa plata'
      });
    });
  });

  describe('Context and Cache', () => {
    test('should use context for missing entities', () => {
      // First message sets context
      const firstMessage = 'rezervare Andrei Anton dubla 16-18 apr';
      const firstResult = extractEntities(firstMessage, CHAT_INTENTS.RESERVATION);
      expect(firstResult).toEqual({
        fullName: 'Andrei Anton',
        roomType: 'dubla',
        startDate: '2024-04-16',
        endDate: '2024-04-18'
      });

    });

    test('should use cache for identical messages', () => {
      const message = 'rezervare Andrei Anton dubla 16-18 apr';
      const firstResult = extractEntities(message, CHAT_INTENTS.RESERVATION);
      const secondResult = extractEntities(message, CHAT_INTENTS.RESERVATION);
      expect(secondResult).toEqual(firstResult);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid messages', () => {
      const result = extractEntities('', CHAT_INTENTS.RESERVATION);
      expect(result).toEqual({});
    });

    test('should handle messages with no extractable entities', () => {
      const result = extractEntities('salut', CHAT_INTENTS.UNKNOWN);
      expect(result).toEqual({});
    });
  });
}); 