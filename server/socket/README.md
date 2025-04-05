# WebSocket Message Types Documentation

## Overview
This document describes all message types used in the WebSocket communication between the server and clients.

## Message Categories

### 1. Incoming Messages
Messages received from clients.

```json
{
  "type": "chat_message",
  "content": "string"
}
```

### 2. Outgoing Messages
Messages sent to clients.

#### 2.1 Chat Messages
```json
{
  "type": "chat",
  "response": {
    "intent": "string",
    "type": "string",
    "message": "string",
    "extraIntents": ["string"],
    "reservation": null
  }
}
```

#### 2.2 Notifications
```json
{
  "type": "notification",
  "notification": {
    "title": "string",
    "message": "string",
    "type": "string",
    "data": {}
  }
}
```

#### 2.3 Reservations
```json
{
  "type": "reservations",
  "action": "string",
  "data": {
    "reservations": [
      {
        "id": "number",
        "fullName": "string",
        "phone": "string",
        "email": "string",
        "startDate": "date",
        "endDate": "date",
        "status": "string",
        "rooms": [
          {
            "roomNumber": "string",
            "type": "string",
            "basePrice": "number",
            "price": "number",
            "startDate": "date",
            "endDate": "date",
            "status": "string"
          }
        ],
        "isPaid": "boolean",
        "hasInvoice": "boolean",
        "hasReceipt": "boolean",
        "notes": "string"
      }
    ]
  }
}
```

#### 2.4 History
```json
{
  "type": "history",
  "data": {
    "total": "number",
    "page": "number",
    "pageSize": "number",
    "totalPages": "number",
    "items": [
      {
        "type": "string",
        "action": "string",
        "content": {},
        "metadata": {},
        "expiresAt": "date",
        "createdAt": "date"
      }
    ]
  }
}
```

## Chat Intents

### 1. Reservation Intents
- `reservation`
- `modify_reservation`
- `cancel_reservation`
- `add_phone`

### 2. Room Intents
- `create_room`
- `modify_room`
- `room_problem`

### 3. Report Intents
- `show_reports`
- `show_invoices`
- `show_room_invoice`

### 4. POS Intents
- `show_pos`
- `sell_product`

### 5. Calendar and Stock Intents
- `show_calendar`
- `show_stock`

### 6. Other Intents
- `unknown_intent`
- `default`

## Response Types

### 1. Confirmation
```json
{
  "type": "confirm",
  "message": "string"
}
```

### 2. POS
```json
{
  "type": "pos",
  "data": {
    "product": "string",
    "quantity": "number",
    "price": "number"
  }
}
```

### 3. Room
```json
{
  "type": "room",
  "data": {
    "roomNumber": "string",
    "type": "string",
    "status": "string"
  }
}
```

### 4. Error
```json
{
  "type": "error",
  "message": "string"
}
```

### 5. Action
```json
{
  "type": "action",
  "data": {
    "action": "string",
    "params": {}
  }
}
```

### 6. Info
```json
{
  "type": "info",
  "data": {
    "message": "string",
    "details": {}
  }
}
```

## Automation Messages

### 1. Booking Email
```json
{
  "type": "notification",
  "notification": {
    "title": "Verificare email-uri Booking",
    "message": "string",
    "type": "booking_email",
    "data": {
      "result": {
        "success": "boolean",
        "message": "string"
      },
      "data": {
        "guestName": "string"
      }
    }
  }
}
```

### 2. WhatsApp Message
```json
{
  "type": "notification",
  "notification": {
    "title": "Verificare mesaje WhatsApp",
    "message": "string",
    "type": "whatsapp_message",
    "data": {
      "result": {
        "success": "boolean",
        "message": "string"
      },
      "data": {
        "guestName": "string"
      }
    }
  }
}
```

## Best Practices

1. Always validate incoming messages for required fields
2. Use appropriate response types based on the action
3. Include error handling in all message processing
4. Maintain consistent message structure across the application
5. Document any changes to message formats
6. Use appropriate data types for all fields
7. Include timestamps where relevant
8. Handle message expiration where applicable 