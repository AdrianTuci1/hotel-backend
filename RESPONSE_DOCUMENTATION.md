# Server Response Documentation

This document outlines the structure of responses sent from the server's socket handlers, primarily via the `server/socket/utils/uiResponder.js` module. These responses instruct the frontend client on how to update the UI or display information.

## 1. Secondary View Actions (`RESPONSE_TYPES.SECONDARY`)

These responses instruct the client to switch the main secondary view (e.g., Calendar, POS, Stock). They only contain the `intent` and the `action` identifier for the view.

---

### `sendShowCalendar()`

*   **Purpose:** Switch to Calendar view.
*   **Intent:** `CHAT_INTENTS.SHOW_CALENDAR`
*   **Type:** `RESPONSE_TYPES.SECONDARY`
*   **Action:** `"show_calendar"`
*   **Payload:** None

```json
{
  "intent": "SHOW_CALENDAR",
  "type": "SECONDARY",
  "action": "show_calendar"
}
```

---

### `sendShowStock()`

*   **Purpose:** Switch to Stock view.
*   **Intent:** `CHAT_INTENTS.SHOW_STOCK`
*   **Type:** `RESPONSE_TYPES.SECONDARY`
*   **Action:** `"show_stock"`
*   **Payload:** None

```json
{
  "intent": "SHOW_STOCK",
  "type": "SECONDARY",
  "action": "show_stock"
}
```

---

### `sendShowReports()`

*   **Purpose:** Switch to Reports view.
*   **Intent:** `CHAT_INTENTS.SHOW_REPORTS`
*   **Type:** `RESPONSE_TYPES.SECONDARY`
*   **Action:** `"show_reports"`
*   **Payload:** None

```json
{
  "intent": "SHOW_REPORTS",
  "type": "SECONDARY",
  "action": "show_reports"
}
```

---

### `sendShowInvoices()`

*   **Purpose:** Switch to Invoices view.
*   **Intent:** `CHAT_INTENTS.SHOW_INVOICES`
*   **Type:** `RESPONSE_TYPES.SECONDARY`
*   **Action:** `"show_invoices"`
*   **Payload:** None

```json
{
  "intent": "SHOW_INVOICES",
  "type": "SECONDARY",
  "action": "show_invoices"
}
```

---

### `sendShowPos()`

*   **Purpose:** Switch to POS view.
*   **Intent:** `CHAT_INTENTS.SHOW_POS`
*   **Type:** `RESPONSE_TYPES.SECONDARY`
*   **Action:** `"show_pos"`
*   **Payload:** None

```json
{
  "intent": "SHOW_POS",
  "type": "SECONDARY",
  "action": "show_pos"
}
```

---

## 2. Overlay Actions (`RESPONSE_TYPES.OVERLAY`)

These responses instruct the client to open a specific overlay/modal/form and provide the necessary data. They *also* include an `action` field indicating the associated secondary view context.

---

### `sendOpenNewReservationOverlay()`

*   **Purpose:** Open "New Reservation" overlay with data.
*   **Intent:** `CHAT_INTENTS.RESERVATION`
*   **Type:** `RESPONSE_TYPES.OVERLAY`
*   **Action:** `"show_calendar"` (Overlay context)
*   **Payload:** Reservation details (`fullName`, `roomType`, `startDate`, `endDate`).

```json
{
  "intent": "RESERVATION",
  "type": "OVERLAY",
  "action": "show_calendar",
  "payload": {
      "fullName": "string | null",
      "roomType": "string | null",
      "startDate": "string (YYYY-MM-DD)",
      "endDate": "string (YYYY-MM-DD)"
  }
}
```

---

### `sendOpenModifyReservationOverlay()`

*   **Purpose:** Open "Modify Reservation" overlay with existing reservation data.
*   **Intent:** `CHAT_INTENTS.MODIFY_RESERVATION`
*   **Type:** `RESPONSE_TYPES.OVERLAY`
*   **Action:** `"show_calendar"` (Overlay context)
*   **Payload:** Reservation details (`id`, `roomNumber`, `startDate`, `endDate`).

```json
{
  "intent": "MODIFY_RESERVATION",
  "type": "OVERLAY",
  "action": "show_calendar",
  "payload": {
      "id": "integer",
      "roomNumber": "string",
      "startDate": "string (YYYY-MM-DD)",
      "endDate": "string (YYYY-MM-DD)"
  }
}
```

---

### `sendOpenPosForSale()`

*   **Purpose:** Open POS overlay for selling a specific product.
*   **Intent:** `CHAT_INTENTS.SELL_PRODUCT`
*   **Type:** `RESPONSE_TYPES.OVERLAY`
*   **Action:** `"show_pos"` (Overlay context)
*   **Payload:** POS sale details (`productName`, `quantity`).

```json
{
  "intent": "SELL_PRODUCT",
  "type": "OVERLAY",
  "action": "show_pos",
  "payload": {
      "productName": "string",
      "quantity": "integer"
  }
}
```

---

### `sendCreateRoomResponse()`

*   **Purpose:** Open "Create Room" overlay/form with pre-filled data.
*   **Intent:** `CHAT_INTENTS.CREATE_ROOM`
*   **Type:** `RESPONSE_TYPES.OVERLAY`
*   **Action:** `"show_calendar"` (Implied context, TBD on frontend)
*   **Payload:** New room details (`number`, `type`, `price`).

```json
{
  "intent": "CREATE_ROOM",
  "type": "OVERLAY",
  "action": "show_calendar",
  "payload": {
      "number": "string",
      "type": "string",
      "price": "number | null"
  }
}
```

---

### `sendModifyRoomResponse()`

*   **Purpose:** Open "Modify Room" overlay/form with existing room data.
*   **Intent:** `CHAT_INTENTS.MODIFY_ROOM`
*   **Type:** `RESPONSE_TYPES.OVERLAY`
*   **Action:** `"show_calendar"` (Implied context, TBD on frontend)
*   **Payload:** Room details including `id` (`id`, `number`, `type`, `price`).

```json
{
  "intent": "MODIFY_ROOM",
  "type": "OVERLAY",
  "action": "show_calendar",
  "payload": {
      "id": "integer",
      "number": "string",
      "type": "string", 
      "price": "number | null"
  }
}
```

---

## 3. Chat Messages (`RESPONSE_TYPES.CHAT`)

These responses send simple textual feedback or confirmation messages to the chat interface.

---

### `sendProblemReportConfirmation()`

*   **Purpose:** Confirm successful room problem reporting.
*   **Intent:** `CHAT_INTENTS.ROOM_PROBLEM`
*   **Type:** `RESPONSE_TYPES.CHAT`
*   **Payload:** None

```json
{
  "intent": "ROOM_PROBLEM",
  "type": "CHAT",
  "message": "Problema a fost raportată cu succes pentru camera [roomNumber]"
}
```

---

### `sendAddPhoneConfirmation()`

*   **Purpose:** Confirm successful phone number association.
*   **Intent:** `CHAT_INTENTS.ADD_PHONE`
*   **Type:** `RESPONSE_TYPES.CHAT`
*   **Payload:** None

```json
{
  "intent": "ADD_PHONE",
  "type": "CHAT",
  "message": "Numărul de telefon [phoneNumber] a fost adăugat cu succes la rezervarea #[reservation.id]."
}
```

---

### `sendDeleteRoomConfirmation()`

*   **Purpose:** Ask for confirmation before deleting a room.
*   **Intent:** `CHAT_INTENTS.DELETE_ROOM`
*   **Type:** `RESPONSE_TYPES.CHAT`
*   **Payload:** None

```json
{
  "intent": "DELETE_ROOM",
  "type": "CHAT",
  "message": "Sigur doriți să ștergeți camera [roomData.number]?"
}
```

---

### `sendErrorResponse()`

*   **Purpose:** Inform the user about an error.
*   **Intent:** Varies (matches the intent of the failed operation).
*   **Type:** `RESPONSE_TYPES.CHAT`
*   **Payload:** None

```json
{
  "intent": "string (Original Intent)",
  "type": "CHAT",
  "message": "string (Error description)"
}
```

---

### `sendDefaultResponse()`

*   **Purpose:** Inform the user that the request was not understood.
*   **Intent:** `CHAT_INTENTS.DEFAULT`
*   **Type:** `RESPONSE_TYPES.CHAT`
*   **Payload:** None

```json
{
  "intent": "DEFAULT",
  "type": "CHAT",
  "message": "Îmi pare rău, dar nu am înțeles exact ce doriți să faceți. Vă pot ajuta cu rezervări, vizualizarea calendarului, rapoarte sau stocuri."
}
``` 