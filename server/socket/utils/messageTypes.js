// 📨 Tipuri de mesaje primite de la client
const INCOMING_MESSAGE_TYPES = {
  CHAT_MESSAGE: 'chat_message',
  RESERVATION_ACTION: 'reservation_action',
  ROOM_ACTION: 'room_action',
  POS_ACTION: 'pos_action',
  AUTOMATION_ACTION: 'automation_action'
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
  DELETE_ROOM: 'delete_room',
  
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
  PHONE: 'phone',
  FORM: 'form',
  CONFIRM: 'confirm',
  LIST: 'list',
  POS: 'pos',
  ROOM: 'room',
  ERROR: 'error',
  ACTION: 'action',
  OPTIONS: 'options',
  INFO: 'info'
};

// 🔄 Tipuri de acțiuni pentru rezervări
const RESERVATION_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  ADD_PHONE: 'add_phone'
};

// 🏨 Tipuri de acțiuni pentru camere
const ROOM_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

// 🛒 Tipuri de acțiuni pentru POS
const POS_ACTIONS = {
  SELL: 'sell',
  REFUND: 'refund',
  CLOSE_SALE: 'close_sale'
};

const AUTOMATION_ACTIONS = {
  BOOKING_EMAIL: 'BOOKING_EMAIL',
  WHATSAPP_MESSAGE: 'WHATSAPP_MESSAGE',
  PRICE_ANALYSIS: 'PRICE_ANALYSIS'
};

module.exports = {
  INCOMING_MESSAGE_TYPES,
  OUTGOING_MESSAGE_TYPES,
  CHAT_INTENTS,
  RESPONSE_TYPES,
  RESERVATION_ACTIONS,
  ROOM_ACTIONS,
  POS_ACTIONS,
  AUTOMATION_ACTIONS
}; 