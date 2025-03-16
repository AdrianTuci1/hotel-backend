# Socket Module

## Overview
This module handles real-time communication between the server and clients using WebSockets. It follows a clear modular architecture with separation of concerns:

- **Actions**: Handle incoming socket events and route them to appropriate controllers
- **Controllers**: Process specific types of client requests and coordinate with services
- **Services**: Implement the business logic
- **Utils**: Provide shared constants and utility functions

## Directory Structure

```
/socket
├── actions/
│   ├── actionHandler.js        # Routes incoming messages to appropriate controllers
│   └── connectionHandler.js    # Manages WebSocket connections
├── controllers/
│   ├── automationController.js # Controls automation-related actions
│   ├── chatController.js       # Controls chat-related actions
│   └── reservationController.js # Controls reservation-related actions
├── services/
│   ├── automationService.js    # Business logic for automations
│   ├── chatService.js          # Business logic for chat interactions
│   └── reservationService.js   # Business logic for reservations
├── utils/
│   └── messageTypes.js         # Contains message type constants
├── index.js                    # Main export file
├── README.md                   # Documentation
└── webSocket.js                # WebSocket initialization
```

## Flow of Messages

1. Client sends a WebSocket message
2. `connectionHandler.js` receives the message and passes it to `actionHandler.js`
3. `actionHandler.js` parses the message and routes it to the appropriate controller
4. Controller calls one or more services to perform business logic
5. Services perform the requested operations and return results
6. Controller formats the response and sends it back to the client

## Message Types

The system supports several types of messages, all defined in `utils/messageTypes.js`:

- **Chat Messages**: Natural language interactions with the system
- **Reservation Actions**: CRUD operations for reservations
- **Room Actions**: CRUD operations for rooms
- **POS Actions**: Point of sale operations
- **Automation Actions**: Automated processes like email checking

## Adding New Functionality

To add a new feature:

1. Define new message types in `utils/messageTypes.js`
2. Implement the business logic in a service
3. Create a controller to handle the actions
4. Register the controller in `actionHandler.js`

## Example Usage

```javascript
// In server code
const { initSocket } = require('./socket');

// Initialize WebSocket when HTTP server is started
const server = http.createServer(app);
const wss = initSocket();

// Attach WebSocket server to HTTP server
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/api/chat') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});
``` 