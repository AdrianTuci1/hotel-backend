# Server Response Documentation

This document outlines the structure of responses sent from the server's socket handlers. These responses instruct the frontend client on how to update the UI or display information using three primary message types: `OVERLAY`, `APPOINTMENTS`, and `HISTORY`.

## 1. Overlay Actions (`OVERLAY`)

These messages instruct the client to either switch the main view (like Calendar, POS) or open a specific overlay/modal/form. The distinction is made by the `action` field and the presence of a `payload`.

---

### **View Switching Actions**

*   **Purpose:** Switch the main UI view.
*   **Type:** `OVERLAY`
*   **Payload:** `null` or absent

#### Example: Switch to Calendar view

*   **Intent:** `CHAT_INTENTS.SHOW_CALENDAR`
*   **Action:** `"show_calendar"`

```json
{
  "intent": "SHOW_CALENDAR",
  "type": "OVERLAY",
  "action": "show_calendar"
}
```

#### Example: Switch to Stock view

*   **Intent:** `CHAT_INTENTS.SHOW_STOCK`
*   **Action:** `"show_stock"`

```json
{
  "intent": "SHOW_STOCK",
  "type": "OVERLAY",
  "action": "show_stock"
}
```
*(Similar structure for `show_reports`, `show_invoices`, `show_pos`)*

---

### **Overlay/Modal Opening Actions**

*   **Purpose:** Open a specific overlay/modal/form, usually pre-filled with data.
*   **Type:** `OVERLAY`
*   **Payload:** Present and contains data relevant to the overlay.

#### Example: Open "New Reservation" overlay

*   **Intent:** `CHAT_INTENTS.RESERVATION`
*   **Action:** `"show_calendar"` (Indicates the context where the overlay appears)
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

#### Example: Open "Modify Reservation" overlay

*   **Intent:** `CHAT_INTENTS.MODIFY_RESERVATION`
*   **Action:** `"show_calendar"` (Context)
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

#### Example: Open POS for Sale overlay

*   **Intent:** `CHAT_INTENTS.SELL_PRODUCT`
*   **Action:** `"show_pos"` (Context)
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

#### Example: Open "Create Room" overlay

*   **Intent:** `CHAT_INTENTS.CREATE_ROOM`
*   **Action:** `"show_calendar"` (Context)
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

#### Example: Open "Modify Room" overlay

*   **Intent:** `CHAT_INTENTS.MODIFY_ROOM`
*   **Action:** `"show_calendar"` (Context)
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

## 2. Appointment Data (`APPOINTMENTS`)

These messages are sent by the server to provide the client with the current list of appointments (formerly reservations), typically upon connection and when updates occur.

---

### Active Appointments Update

*   **Purpose:** Send the initial list of active appointments or update the existing list.
*   **Type:** `APPOINTMENTS`
*   **Action:** `"init"` (initial load), `"update"` (subsequent updates - specific action might vary)
*   **Payload Structure:** Contains the list of appointments.

```json
{
  "type": "APPOINTMENTS",
  "action": "string ('init' or update action)",
  "data": {
    "appointments": [ // Renamed from 'reservations'
      {
        "id": "number",
        "fullName": "string",
        "phone": "string",
        "email": "string",
        "startDate": "string (YYYY-MM-DD)",
        "endDate": "string (YYYY-MM-DD)",
        "status": "string",
        "rooms": [
          {
            "roomNumber": "string",
            "type": "string",
            "basePrice": "number",
            "price": "number",
            "startDate": "string (YYYY-MM-DD)",
            "endDate": "string (YYYY-MM-DD)",
            "status": "string"
          }
        ],
        "isPaid": "boolean",
        "hasInvoice": "boolean",
        "hasReceipt": "boolean",
        "notes": "string"
      }
      // ... other appointments
    ]
  }
}
```

---

## 3. History and Notifications (`HISTORY`)

This message type consolidates chat messages, system events, and notifications into a single stream, typically displayed as a timeline or log. It can include simple text messages, structured event data, and rich notification details.

---

### **General History Structure**

*   **Purpose:** Send a list of history entries or a single new entry.
*   **Type:** `HISTORY`
*   **Payload Structure:** Varies based on the `entryType` within each item.

```json
{
  "type": "HISTORY",
  "data": {
    // Fields for pagination might be present when sending a list
    "total": "number",
    "page": "number",
    "pageSize": "number",
    "totalPages": "number",
    // The actual history items
    "items": [
      {
        "id": "string | number", // Unique ID for the history entry
        "entryType": "string ('message', 'notification', 'event', etc.)", 
        "timestamp": "string (ISO Date)",
        "payload": {
           // Content specific to the entryType
        }
      }
      // ... other history items
    ]
  }
}
```
*Note: The exact structure of the `data` wrapper (pagination fields) might only apply when fetching a list, while individual updates might send a single item structure directly or wrapped differently.*

---

### **History Entry Types**

#### `entryType: 'message'` (Formerly `CHAT`)

*   **Purpose:** Simple text messages, confirmations, or errors directed to the user.
*   **Payload:** Contains the original message details.

##### Example: Room Problem Confirmation

```json
// Single History Item Payload:
{
  "id": "hist_id_123",
  "entryType": "message",
  "timestamp": "2024-04-08T10:00:00Z",
  "payload": {
      "intent": "ROOM_PROBLEM", // Original intent
      "message": "Problema a fost raportată cu succes pentru camera [roomNumber]"
  }
}
```

##### Example: Error Response

```json
// Single History Item Payload:
{
  "id": "hist_id_124",
  "entryType": "message",
  "timestamp": "2024-04-08T10:01:00Z",
  "payload": {
      "intent": "MODIFY_RESERVATION", // Original intent that failed
      "message": "Eroare: Nu am putut modifica rezervarea."
  }
}
```
*(Similar structure for `ADD_PHONE` confirmation, `DELETE_ROOM` confirmation, `DEFAULT` response)*

---

#### `entryType: 'notification'` (Formerly `notification`)

*   **Purpose:** Inform about the results or status of automated tasks or significant system events.
*   **Payload:** Contains the original notification structure.

##### Example: Booking.com Email Notification

```json
// Single History Item Payload:
{
  "id": "hist_id_125",
  "entryType": "notification",
  "timestamp": "2024-04-08T10:05:00Z",
  "payload": {
    // Original notification object
    "title": "Verificare email-uri Booking",
    "message": "Rezervare creată automat pentru John Doe",
    "type": "booking_email", // Sub-type of notification
    "data": {
        "result": { "success": true, "message": "..." },
        "data": { "guestName": "John Doe" }
    }
  }
}
```

##### Example: WhatsApp Message Notification

```json
// Single History Item Payload:
{
  "id": "hist_id_126",
  "entryType": "notification",
  "timestamp": "2024-04-08T10:10:00Z",
  "payload": {
    // Original notification object
    "title": "Procesare Mesaj WhatsApp",
    "message": "Rezervare creată din WhatsApp pentru Ion Popescu",
    "type": "whatsapp_message",
    "data": {
        // Original data from processWhatsAppMessage result
        "data": { "guestName": "Ion Popescu", ... },
        "result": { "success": true, ... },
        "confirmationMessage": "...",
        "historyEntry": { ... },
        "requiresIntervention": false,
        "lastMessages": ["..."]
    }
  }
}
```

##### Example: Price Analysis Notification

```json
// Single History Item Payload:
{
  "id": "hist_id_127",
  "entryType": "notification",
  "timestamp": "2024-04-08T10:15:00Z",
  "payload": {
      // Original notification object
      "title": "Analiză Prețuri Camere",
      "message": "Analiza prețurilor finalizată.",
      "type": "price_analysis",
      "data": {
          "analysis": { ... },
          "roomType": "Double",
          "currentPrice": 200
      }
  }
}
```

---

#### `entryType: 'event'` (Formerly part of `history`)

*   **Purpose:** Log significant system or user actions that aren't simple messages or standard notifications.
*   **Payload:** Contains details about the event.

##### Example: Generic History Event

```json
// Single History Item Payload:
{
  "id": "hist_id_128",
  "entryType": "event",
  "timestamp": "2024-04-08T10:20:00Z",
  "payload": {
    // Original history item structure (excluding metadata already at top level)
    "eventType": "string (e.g., 'user_login', 'manual_reservation_update')",
    "action": "string (e.g., 'success', 'failed', 'details_changed')",
    "content": {}, // Details specific to the event type and action
    "metadata": {} // Additional context
  }
}
```
*Note: You might choose to flatten the original history item structure further into this payload.* 