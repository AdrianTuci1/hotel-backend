# Conectare la WebSocket Server

## Configurare

Pentru a te conecta la serverul WebSocket, trebuie să folosești următoarea configurație:

```javascript
const ws = new WebSocket('ws://localhost:3000/api/chat');
```

> **Notă importantă**: La conectare, serverul va trimite automat toate rezervările active cu `action: 'init'`. Nu trebuie să trimiți tu un mesaj de inițializare.

## Event Handlers

### Conectare (onopen)
```javascript
ws.onopen = () => {
  console.log('✅ Conectat la serverul WebSocket');
  // Serverul va trimite automat rezervările active
};
```

### Primire mesaje (onmessage)
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  // Procesare mesaje în funcție de tip
  switch (data.type) {
    case 'RESERVATIONS_UPDATE':
      if (data.action === 'init') {
        // Inițializare rezervări - primit automat la conectare
        console.log('Rezervări inițiale:', data.reservations);
      } else if (data.action === 'sync') {
        // Actualizare rezervări - primit când apar modificări
        console.log('Actualizare rezervări:', data.reservations);
      }
      break;
      
    case 'ERROR':
      console.error('Eroare server:', data.message);
      break;
      
    case 'NOTIFICATION':
      console.log('Notificare:', data.notification);
      break;
      
    default:
      console.log('Mesaj primit:', data);
  }
};
```

### Erori (onerror)
```javascript
ws.onerror = (error) => {
  console.error('❌ Eroare WebSocket:', error);
};
```

### Deconectare (onclose)
```javascript
ws.onclose = () => {
  console.log('🔌 Deconectat de la serverul WebSocket');
};
```

## Trimitere mesaje

Pentru a trimite mesaje către server, folosește următorul format:

```javascript
// Trimitere mesaj de chat
ws.send(JSON.stringify({
  type: 'CHAT_MESSAGE',
  content: 'Mesajul tău aici'
}));

// Trimitere acțiune de rezervare
ws.send(JSON.stringify({
  type: 'RESERVATION_ACTION',
  action: 'CREATE',
  data: {
    // datele rezervării
  }
}));
```

## Tipuri de mesaje acceptate

### 1. CHAT_MESSAGE
```javascript
{
  type: 'CHAT_MESSAGE',
  content: 'Textul mesajului'
}
```

### 2. RESERVATION_ACTION
```javascript
{
  type: 'RESERVATION_ACTION',
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  data: {
    // datele specifice acțiunii
  }
}
```

### 3. AUTOMATION_ACTION
```javascript
{
  type: 'AUTOMATION_ACTION',
  action: 'BOOKING_EMAIL' | 'WHATSAPP_MESSAGE' | 'PRICE_ANALYSIS'
}
```

## Răspunsuri de la server

Serverul poate trimite următoarele tipuri de răspunsuri:

### 1. RESERVATIONS_UPDATE
```javascript
{
  type: 'RESERVATIONS_UPDATE',
  action: 'init' | 'sync',  // 'init' la conectare, 'sync' la modificări
  reservations: [
    {
      id: number,
      fullName: string,
      phone: string,
      email: string,
      startDate: string,
      endDate: string,
      status: string,
      rooms: Array<{
        roomNumber: string,
        type: string,
        basePrice: number,
        price: number,
        startDate: string,
        endDate: string,
        status: string
      }>,
      isPaid: boolean,
      hasInvoice: boolean,
      hasReceipt: boolean,
      notes: string
    }
  ]
}
```

### 2. ERROR
```javascript
{
  type: 'ERROR',
  message: 'Descrierea erorii'
}
```

### 3. NOTIFICATION
```javascript
{
  type: 'NOTIFICATION',
  notification: {
    title: string,
    message: string,
    type: string,
    data: object
  }
}
```

## Exemplu complet de implementare

```javascript
class WebSocketClient {
  constructor() {
    this.ws = null;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket('ws://localhost:3000/api/chat');

    this.ws.onopen = () => {
      console.log('✅ Conectat la serverul WebSocket');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('❌ Eroare WebSocket:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 Deconectat de la serverul WebSocket');
      // Opțional: Reconnect după un timp
      setTimeout(() => this.connect(), 5000);
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'RESERVATIONS_UPDATE':
        this.handleReservationsUpdate(data);
        break;
      case 'ERROR':
        this.handleError(data);
        break;
      case 'NOTIFICATION':
        this.handleNotification(data);
        break;
      default:
        console.log('Mesaj necunoscut:', data);
    }
  }

  handleReservationsUpdate(data) {
    if (data.action === 'init') {
      // Inițializare rezervări în UI
      console.log('Rezervări inițiale:', data.reservations);
    } else if (data.action === 'sync') {
      // Actualizare rezervări în UI
      console.log('Actualizare rezervări:', data.reservations);
    }
  }

  handleError(data) {
    console.error('Eroare server:', data.message);
    // Afișare eroare în UI
  }

  handleNotification(data) {
    console.log('Notificare:', data.notification);
    // Afișare notificare în UI
  }

  sendMessage(type, content) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type,
        ...content
      }));
    } else {
      console.error('WebSocket nu este conectat');
    }
  }
}

// Utilizare
const wsClient = new WebSocketClient();

// Trimitere mesaj
wsClient.sendMessage('CHAT_MESSAGE', {
  content: 'Bună! Vreau să fac o rezervare.'
});
``` 