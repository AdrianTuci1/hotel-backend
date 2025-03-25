// 📨 Tipuri de mesaje primite de la client
const INCOMING_MESSAGE_TYPES = {
  CHAT_MESSAGE: 'chat_message'
};

// 📤 Tipuri de mesaje trimise către client
const OUTGOING_MESSAGE_TYPES = {
  CHAT_RESPONSE: 'chat_response',
  RESERVATIONS_UPDATE: 'reservations_update',
  ROOMS_UPDATE: 'rooms_update',
  POS_UPDATE: 'pos_update',
  ERROR: 'error',
  NOTIFICATION: 'notification'
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
  ROOM_PROBLEM: 'room_problem',
  
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

// 📝 Tipuri de răspunsuri pentru chat
const RESPONSE_TYPES = {
  CONFIRM: 'confirm',
  POS: 'pos',
  ROOM: 'room',
  ERROR: 'error',
  ACTION: 'action',
  INFO: 'info'
};

module.exports = {
  INCOMING_MESSAGE_TYPES,
  OUTGOING_MESSAGE_TYPES,
  CHAT_INTENTS,
  RESPONSE_TYPES
}; 