const { CHAT_INTENTS, RESPONSE_TYPES } = require("./messageTypes");

/**
 * [SECONDARY] Sends a response to show the calendar.
 * @param {Function} sendResponse - The callback function to send the response.
 */
const sendShowCalendar = (sendResponse) => {
  const response = {
    intent: CHAT_INTENTS.SHOW_CALENDAR,
    type: RESPONSE_TYPES.SECONDARY,
    action: "show_calendar",
  };
  sendResponse(response);
};

/**
 * [SECONDARY] Sends a response to show the stock module.
 * @param {Function} sendResponse - The callback function to send the response.
 */
const sendShowStock = (sendResponse) => {
  const response = {
    intent: CHAT_INTENTS.SHOW_STOCK,
    type: RESPONSE_TYPES.SECONDARY,
    action: "show_stock",
  };
  sendResponse(response);
};

/**
 * [SECONDARY] Sends a response to show the reports module.
 * @param {Function} sendResponse - The callback function to send the response.
 */
const sendShowReports = (sendResponse) => {
  const response = {
    intent: CHAT_INTENTS.SHOW_REPORTS,
    type: RESPONSE_TYPES.SECONDARY,
    action: "show_reports",
  };
  sendResponse(response);
};

/**
 * [SECONDARY] Sends a response to show the invoices module.
 * @param {Function} sendResponse - The callback function to send the response.
 */
const sendShowInvoices = (sendResponse) => {
  const response = {
    intent: CHAT_INTENTS.SHOW_INVOICES,
    type: RESPONSE_TYPES.SECONDARY,
    action: "show_invoices",
  };
  sendResponse(response);
};

/**
 * [SECONDARY] Sends a response to show the POS module.
 * @param {Function} sendResponse - The callback function to send the response.
 */
const sendShowPos = (sendResponse) => {
  const response = {
    intent: CHAT_INTENTS.SHOW_POS,
    type: RESPONSE_TYPES.SECONDARY,
    action: "show_pos",
  };
  sendResponse(response);
};

/**
 * [OVERLAY] Sends a response to open the new reservation overlay (in calendar context).
 * @param {Function} sendResponse - The callback function to send the response.
 * @param {Object} reservationData - Data for the new reservation (fullName, roomType, startDate, endDate).
 */
const sendOpenNewReservationOverlay = (sendResponse, reservationData) => {
  const response = {
    intent: CHAT_INTENTS.RESERVATION,
    type: RESPONSE_TYPES.OVERLAY,
    action: "show_calendar",
    payload: reservationData
  };
  sendResponse(response);
};

/**
 * [OVERLAY] Sends a response to open the modify reservation overlay (in calendar context).
 * @param {Function} sendResponse - The callback function to send the response.
 * @param {Object} reservationData - Data for the existing reservation (id, roomNumber, startDate, endDate).
 */
const sendOpenModifyReservationOverlay = (sendResponse, reservationData) => {
  const response = {
    intent: CHAT_INTENTS.MODIFY_RESERVATION,
    type: RESPONSE_TYPES.OVERLAY,
    action: "show_calendar",
    payload: reservationData
  };
  sendResponse(response);
};

/**
 * [CHAT] Sends a generic error response.
 * @param {Function} sendResponse - The callback function to send the response.
 * @param {String} intent - The original intent.
 * @param {String} message - The error message.
 */
const sendErrorResponse = (sendResponse, intent, message) => {
  const response = {
    intent: intent,
    type: RESPONSE_TYPES.CHAT,
    message: message,
  };
  sendResponse(response);
};

/**
 * [OVERLAY] Sends a response to open the POS module for selling a product (in POS context).
 * @param {Function} sendResponse - The callback function to send the response.
 * @param {Object} posData - Data for the POS sale (productName, quantity).
 */
const sendOpenPosForSale = (sendResponse, posData) => {
  const response = {
    intent: CHAT_INTENTS.SELL_PRODUCT,
    type: RESPONSE_TYPES.OVERLAY,
    action: "show_pos",
    payload: posData
  };
  sendResponse(response);
};

/**
 * [CHAT] Sends a confirmation response after reporting a room problem.
 * @param {Function} sendResponse - The callback function to send the response.
 * @param {Object} problemData - Data about the reported problem (roomNumber, problemDescription, reportedAt, status).
 */
const sendProblemReportConfirmation = (sendResponse, problemData) => {
  const { roomNumber } = problemData;
  const response = {
    intent: CHAT_INTENTS.ROOM_PROBLEM,
    type: RESPONSE_TYPES.CHAT,
    message: `Problema a fost raportată cu succes pentru camera ${roomNumber}`,
  };
  sendResponse(response);
};

/**
 * [CHAT] Sends a confirmation response after associating a phone number with a reservation.
 * @param {Function} sendResponse - The callback function to send the response.
 * @param {string} phoneNumber - The phone number added.
 * @param {Object} reservationData - Data for the associated reservation.
 */
const sendAddPhoneConfirmation = (sendResponse, phoneNumber, reservationData) => {
  const response = {
    intent: CHAT_INTENTS.ADD_PHONE,
    type: RESPONSE_TYPES.CHAT,
    message: `Numărul de telefon ${phoneNumber} a fost adăugat cu succes la rezervarea #${reservationData.id}.`,
  };
  sendResponse(response);
};

/**
 * [OVERLAY] Sends a response with data needed to create a new room (in calendar context).
 * @param {Function} sendResponse - The callback function to send the response.
 * @param {Object} roomData - Data for the new room (number, type, price).
 */
const sendCreateRoomResponse = (sendResponse, roomData) => {
  const response = {
    intent: CHAT_INTENTS.CREATE_ROOM,
    type: RESPONSE_TYPES.OVERLAY,
    action: "show_calendar",
    payload: roomData
  };
  sendResponse(response);
};

/**
 * [OVERLAY] Sends a response with data needed to modify an existing room (in calendar context).
 * @param {Function} sendResponse - The callback function to send the response.
 * @param {Object} roomData - Data for modifying the room (id, number, type, price).
 */
const sendModifyRoomResponse = (sendResponse, roomData) => {
  const response = {
    intent: CHAT_INTENTS.MODIFY_ROOM,
    type: RESPONSE_TYPES.OVERLAY,
    action: "show_calendar",
    payload: roomData
  };
  sendResponse(response);
};

/**
 * [CHAT] Sends a confirmation request before deleting a room.
 * @param {Function} sendResponse - The callback function to send the response.
 * @param {Object} roomData - Data of the room to be deleted (id, number, type).
 */
const sendDeleteRoomConfirmation = (sendResponse, roomData) => {
  const response = {
    intent: CHAT_INTENTS.DELETE_ROOM,
    type: RESPONSE_TYPES.CHAT,
    message: `Sigur doriți să ștergeți camera ${roomData.number}?`,
  };
  sendResponse(response);
};

/**
 * [CHAT] Sends a default response for unrecognized intents.
 * @param {Function} sendResponse - The callback function to send the response.
 */
const sendDefaultResponse = (sendResponse) => {
  const response = {
    intent: CHAT_INTENTS.DEFAULT,
    type: RESPONSE_TYPES.CHAT,
    message: "Îmi pare rău, dar nu am înțeles exact ce doriți să faceți. Vă pot ajuta cu rezervări, vizualizarea calendarului, rapoarte sau stocuri.",
  };
  sendResponse(response);
};

// TODO: Add functions for opening/populating overlays if needed.

module.exports = {
  sendShowCalendar,
  sendShowStock,
  sendShowReports,
  sendShowInvoices,
  sendShowPos,
  sendOpenNewReservationOverlay,
  sendOpenModifyReservationOverlay,
  sendErrorResponse,
  sendOpenPosForSale,
  sendProblemReportConfirmation,
  sendAddPhoneConfirmation,
  sendCreateRoomResponse,
  sendModifyRoomResponse,
  sendDeleteRoomConfirmation,
  sendDefaultResponse
}; 