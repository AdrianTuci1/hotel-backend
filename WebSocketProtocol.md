# WebSocket Protocol Documentation for Hotel Management System

## Connection Setup

### Connection URL
Connect to the WebSocket server at:
```
ws://your-server-url/api/chat
```

### Connection Initialization
When a client connects, the server will automatically:
1. Add the client to the active clients list
2. Send current active reservations data
3. Set up automation checks

## Message Format

### Client to Server Messages

The client can send messages to the server in the following standardized format:

```javascript
{
  "type": "MESSAGE_TYPE",
  "payload": {
    // Message data specific to each message type
  }
}
```

#### Supported Incoming Message Types

| Type | Description | Payload Structure |
|------|-------------|-------------------|
| `CHAT_MESSAGE` | Message for natural language processing | `{ content: "Message text" }` |
| `CHAT_ACTION` | Intent-based action | `{ intent: "INTENT_TYPE", data: {...} }` |
| `RESERVATION_ACTION` | Action related to reservations | `{ action: "ACTION_TYPE", data: {...} }` |
| `ROOM_ACTION` | Action related to rooms | `{ action: "ACTION_TYPE", data: {...} }` |
| `POS_ACTION` | Action related to point of sale | `{ action: "ACTION_TYPE", data: {...} }` |
| `AUTOMATION_ACTION` | Action related to automation | `{ action: "ACTION_TYPE" }` |

#### Example Chat Message
```javascript
{
  "type": "CHAT_MESSAGE",
  "payload": {
    "content": "Rezervă camera 101 de la 15 mai până la 20 mai"
  }
}
```

#### Example Chat Action (Intent-based)
```javascript
{
  "type": "CHAT_ACTION",
  "payload": {
    "intent": "RESERVATION",
    "data": {
      "roomNumber": "101",
      "startDate": "15 mai",
      "endDate": "20 mai"
    }
  }
}
```

#### Example Reservation Action
```javascript
{
  "type": "RESERVATION_ACTION",
  "payload": {
    "action": "CREATE",
    "data": {
      "fullName": "John Doe",
      "phone": "0712345678",
      "email": "john@example.com",
      "startDate": "2023-05-15",
      "endDate": "2023-05-20",
      "rooms": [{"roomNumber": "101"}]
    }
  }
}
```

#### Example Automation Action
```javascript
{
  "type": "AUTOMATION_ACTION",
  "payload": {
    "action": "BOOKING_EMAIL"
  }
}
```

### Server to Client Messages

The server sends messages to clients in the following standardized format:

```javascript
{
  "type": "MESSAGE_TYPE",
  "payload": {
    // Response data specific to each message type
  }
}
```

#### Supported Outgoing Message Types

| Type | Description | Payload Structure |
|------|-------------|-------------------|
| `CHAT_RESPONSE` | Response to chat message | `{ intent, type, message, extraIntents, ...extraData }` |
| `RESERVATIONS_UPDATE` | Reservations data update | `{ action, reservations }` |
| `ROOMS_UPDATE` | Rooms data update | `{ action, rooms }` |
| `POS_UPDATE` | POS data update | `{ action, data }` |
| `ERROR` | Error message | `{ message, code }` |
| `NOTIFICATION` | System notification | `{ message, level }` |

#### Example Chat Response
```javascript
{
  "type": "CHAT_RESPONSE",
  "payload": {
    "intent": "RESERVATION",
    "type": "ACTION",
    "message": "Se deschide formularul pentru o rezervare nouă în camera 101 de la 15 mai până la 20 mai",
    "extraIntents": [],
    "reservation": {
      "roomNumber": "101",
      "startDate": "15 mai",
      "endDate": "20 mai"
    }
  }
}
```

#### Example Reservations Update
```javascript
{
  "type": "RESERVATIONS_UPDATE",
  "payload": {
    "action": "sync",  // "init" for initial data, "sync" for updates
    "reservations": [
      {
        "id": 1,
        "fullName": "John Doe",
        "phone": "0712345678",
        "email": "john@example.com",
        "startDate": "2023-05-15",
        "endDate": "2023-05-20",
        "status": "confirmed",
        "rooms": [
          {
            "roomNumber": "101",
            "type": "standard",
            "basePrice": 200,
            "price": 200,
            "startDate": "2023-05-15",
            "endDate": "2023-05-20",
            "status": "confirmed"
          }
        ],
        "isPaid": true,
        "hasInvoice": true,
        "hasReceipt": true,
        "notes": "Special request for extra pillows"
      }
    ]
  }
}
```

#### Example Error Message
```javascript
{
  "type": "ERROR",
  "payload": {
    "message": "A apărut o eroare la procesarea mesajului",
    "code": "PROCESSING_ERROR"
  }
}
```

## Intent Types and Response Types

### Chat Intent Types (`CHAT_INTENTS`)

| Intent | Description | Response Type |
|--------|-------------|---------------|
| `RESERVATION` | Create a new reservation | `INFO` |
| `MODIFY_RESERVATION` | Modify an existing reservation | `INFO` |
| `CANCEL_RESERVATION` | Cancel a reservation | - |
| `ADD_PHONE` | Add phone number to reservation | `CONFIRM` |
| `CREATE_ROOM` | Create a new room | `ROOM` |
| `MODIFY_ROOM` | Modify room details | `ROOM` |
| `SHOW_REPORTS` | Show reports | `ACTION` |
| `SHOW_INVOICES` | Show invoices | `ACTION` |
| `SHOW_ROOM_INVOICE` | Show room invoice | `ACTION` |
| `SHOW_POS` | Show point of sale module | `ACTION` |
| `SELL_PRODUCT` | Sell a product | `POS` |
| `SHOW_CALENDAR` | Show calendar | `ACTION` |
| `SHOW_STOCK` | Show stock | `ACTION` |
| `UNKNOWN` | Unknown intent | `ACTION` |
| `DEFAULT` | Default intent | `ACTION` |

### Response Types (`RESPONSE_TYPES`)

| Type | Description |
|------|-------------|
| `CONFIRM` | Confirmation response |
| `POS` | Point of sale response |
| `ROOM` | Room-related response |
| `ERROR` | Error response |
| `ACTION` | Action response |
| `INFO` | Informational response |

## Action Types

### Reservation Actions (`RESERVATION_ACTIONS`)
- `CREATE` - Create a new reservation
- `UPDATE` - Update an existing reservation
- `DELETE` - Delete a reservation
- `ADD_PHONE` - Add phone number to reservation

### Room Actions (`ROOM_ACTIONS`)
- `CREATE` - Create a new room
- `UPDATE` - Update room details
- `DELETE` - Delete a room

### POS Actions (`POS_ACTIONS`)
- `SELL` - Sell a product
- `REFUND` - Refund a sale
- `CLOSE_SALE` - Close a sale

### Automation Actions (`AUTOMATION_ACTIONS`)
- `BOOKING_EMAIL` - Send booking email
- `WHATSAPP_MESSAGE` - Send WhatsApp message
- `PRICE_ANALYSIS` - Perform price analysis

## Client Implementation Example

Here's a basic client implementation to connect to the WebSocket server with the standardized message format:

```javascript
// Connect to WebSocket server
const ws = new WebSocket("ws://your-server-url/api/chat");

// Handle connection open
ws.onopen = () => {
  console.log("WebSocket connection established");
};

// Handle incoming messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case "CHAT_RESPONSE":
      handleChatResponse(data.payload);
      break;
      
    case "RESERVATIONS_UPDATE":
      if (data.payload.action === "init") {
        // Initialize reservations in the UI
        initializeReservations(data.payload.reservations);
      } else if (data.payload.action === "sync") {
        // Update existing reservations in the UI
        updateReservations(data.payload.reservations);
      }
      break;
      
    case "ERROR":
      console.error("Server error:", data.payload.message);
      // Display error to user
      showError(data.payload.message);
      break;
      
    default:
      console.log("Received message:", data);
  }
};

// Handle chat responses
function handleChatResponse(payload) {
  const { intent, type, message, extraIntents } = payload;
  
  console.log(`Received ${intent} response of type ${type}: ${message}`);
  
  switch (type) {
    case "ACTION":
      // Perform UI action based on intent
      performAction(intent, payload);
      break;
      
    case "ERROR":
      // Display error to user
      showError(message);
      break;
      
    case "INFO":
    default:
      // Display informational message
      showMessage(message);
      break;
  }
}

// Send a chat message to the server
function sendChatMessage(content) {
  ws.send(JSON.stringify({
    type: "CHAT_MESSAGE",
    payload: {
      content: content
    }
  }));
}

// Perform a chat action (intent-based)
function sendChatAction(intent, data) {
  ws.send(JSON.stringify({
    type: "CHAT_ACTION",
    payload: {
      intent: intent,
      data: data
    }
  }));
}

// Perform a reservation action
function performReservationAction(action, data) {
  ws.send(JSON.stringify({
    type: "RESERVATION_ACTION",
    payload: {
      action: action,
      data: data
    }
  }));
}

// Handle WebSocket closure
ws.onclose = () => {
  console.log("WebSocket connection closed");
  // Attempt to reconnect or notify user
};

// Handle WebSocket errors
ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};
```

## Reservation Format

Reservations are formatted in the following structure:

```javascript
{
  "id": 1,
  "fullName": "John Doe",
  "phone": "0712345678",
  "email": "john@example.com",
  "startDate": "2023-05-15",
  "endDate": "2023-05-20",
  "status": "confirmed", // "booked", "confirmed", "cancelled"
  "rooms": [
    {
      "roomNumber": "101",
      "type": "standard",
      "basePrice": 200,
      "price": 200,
      "startDate": "2023-05-15", // Optional, defaults to reservation startDate
      "endDate": "2023-05-20",   // Optional, defaults to reservation endDate
      "status": "confirmed"
    }
  ],
  "isPaid": true,
  "hasInvoice": true,
  "hasReceipt": true,
  "notes": "Special request for extra pillows"
}
```

## Error Handling

The server handles errors by sending error messages with the `ERROR` type:

```javascript
{
  "type": "ERROR",
  "payload": {
    "message": "Error message describing what went wrong",
    "code": "ERROR_CODE"
  }
}
```

Clients should implement appropriate error handling to display these messages to users and take appropriate actions.

## Real-time Synchronization

The system provides real-time synchronization for reservations:

1. When a client connects, they receive all active reservations with action `init`
2. When reservation data changes, all connected clients receive updates with action `sync`

This ensures all clients have up-to-date information without needing to poll the server. 