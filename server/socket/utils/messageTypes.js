// 📨 Tipuri de mesaje primite de la client
const INCOMING_MESSAGE_TYPES = {
  CHAT_MESSAGE: 'chat_message'
};

// 📤 Tipuri de mesaje trimise către client
const OUTGOING_MESSAGE_TYPES = {
  OVERLAY: 'overlay',             // Combined view switching and modal opening
  APPOINTMENTS: 'appointments',     // Replaces 'reservations'
  HISTORY: 'history'              // Combined history, chat messages, and notifications
};

// 🎯 Tipuri de intenții pentru chat
const CHAT_INTENTS = {
  // Reservation Intents
  RESERVATION: 'reservation',
  MODIFY_RESERVATION: 'modify_reservation',
  CANCEL_RESERVATION: 'cancel_reservation',
  ADD_PHONE: 'add_phone',
  
  // Room Intents
  CREATE_ROOM: 'create_room',
  MODIFY_ROOM: 'modify_room',
  DELETE_ROOM: 'delete_room',
  ROOM_PROBLEM: 'room_problem',
  ROOM: 'room', // Generic room intent, potentially used by create/modify overlay triggers
  
  // Report Intents
  SHOW_REPORTS: 'show_reports',
  SHOW_INVOICES: 'show_invoices',
  SHOW_ROOM_INVOICE: 'show_room_invoice',
  
  // POS Intents
  SHOW_POS: 'show_pos',
  SELL_PRODUCT: 'sell_product',
  
  // Calendar and Stock Intents
  SHOW_CALENDAR: 'show_calendar',
  SHOW_STOCK: 'show_stock',
  
  // Other Intents
  UNKNOWN: 'unknown_intent',
  DEFAULT: 'default'
};

// ❗ Deprecated: RESPONSE_TYPES are merged into OUTGOING_MESSAGE_TYPES
// Keeping the object structure temporarily for easier refactoring reference,
// but these values should not be used directly anymore.
const RESPONSE_TYPES = {
  OVERLAY: 'overlay',     // For opening modals/forms (now part of OUTGOING_MESSAGE_TYPES.OVERLAY)
  // SECONDARY: 'secondary', // Removed: Merged into OVERLAY
  // CHAT: 'chat'        // Removed: Merged into HISTORY
};

// Used within HISTORY payload for entryType: 'notification'
const NOTIFICATION_TYPES = {
  BOOKING_EMAIL: 'booking_email',
  WHATSAPP_MESSAGE: 'whatsapp_message',
  PRICE_ANALYSIS: 'price_analysis',
  HISTORY_UPDATE: 'history_update', // Example if history service broadcasts updates as notifications
  ERROR: 'error',                 // Generic error notification type
  INFO: 'info'                    // Generic info notification type
};

module.exports = {
  INCOMING_MESSAGE_TYPES,
  OUTGOING_MESSAGE_TYPES,
  CHAT_INTENTS,
  // RESPONSE_TYPES, // Intentionally commented out - should be removed after refactor
  NOTIFICATION_TYPES // Exporting notification sub-types
}; 