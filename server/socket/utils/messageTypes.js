// 📨 Tipuri de mesaje primite de la client
const INCOMING_MESSAGE_TYPES = {
  CHAT_MESSAGE: 'chat_message'
};

// 📤 Tipuri de mesaje trimise către client
const OUTGOING_MESSAGE_TYPES = {
  CHAT: 'chat',
  NOTIFICATION: 'notification',
  RESERVATIONS: 'reservations',
  HISTORY: 'history'
};

// 🎯 Tipuri de intenții pentru chat
const CHAT_INTENTS = {
  // Rezervări
  RESERVATION: 'reservation',
  MODIFY_RESERVATION: 'modify_reservation',
  CANCEL_RESERVATION: 'cancel_reservation',
  ADD_PHONE: 'add_phone',
  
  // Camere
  CREATE_ROOM: 'create_room',
  MODIFY_ROOM: 'modify_room',
  DELETE_ROOM: 'delete_room',
  ROOM_PROBLEM: 'room_problem',
  ADD_ROOM: 'add_room',
  
  // Produse
  ADD_PRODUCT: 'add_product',
  
  // Rapoarte și Facturi
  SHOW_REPORTS: 'show_reports',
  SHOW_INVOICES: 'show_invoices',
  SHOW_ROOM_INVOICE: 'show_room_invoice',
  
  // POS
  SHOW_POS: 'show_pos',
  SELL_PRODUCT: 'sell_product',
  
  // Calendar și Altele
  SHOW_CALENDAR: 'show_calendar',
  SHOW_STOCK: 'show_stock',
  
  // Altele
  UNKNOWN: 'unknown_intent',
  DEFAULT: 'default'
};

// 📝 Tipuri de răspunsuri pentru chat (Refactored)
const RESPONSE_TYPES = {
  SECONDARY: 'secondary', // Opens a secondary menu/view
  OVERLAY: 'overlay',   // Opens an overlay/modal/form with data
  CHAT: 'chat'        // Sends a simple text message to the chat interface
};

module.exports = {
  INCOMING_MESSAGE_TYPES,
  OUTGOING_MESSAGE_TYPES,
  CHAT_INTENTS,
  RESPONSE_TYPES
}; 