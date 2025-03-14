# WebSocket Integration Documentation

## 🔌 Conectare

Pentru a vă conecta la serverul WebSocket:

```javascript
const ws = new WebSocket('ws://your-server/api/chat');

ws.onopen = () => {
  console.log('Conectat la server');
};

ws.onclose = () => {
  console.log('Deconectat de la server');
};

ws.onerror = (error) => {
  console.error('Eroare WebSocket:', error);
};
```

## 📨 Tipuri de Mesaje

### Mesaje Trimise (INCOMING_MESSAGE_TYPES)

```javascript
const INCOMING_MESSAGE_TYPES = {
  CHAT_MESSAGE: 'chat_message',
  RESERVATION_ACTION: 'reservation_action',
  ROOM_ACTION: 'room_action',
  POS_ACTION: 'pos_action',
  AUTOMATION_ACTION: 'automation_action'
};
```

### Mesaje Primite (OUTGOING_MESSAGE_TYPES)

```javascript
const OUTGOING_MESSAGE_TYPES = {
  CHAT_RESPONSE: 'chat_response',
  RESERVATIONS_UPDATE: 'reservations_update',
  ROOMS_UPDATE: 'rooms_update',
  POS_UPDATE: 'pos_update',
  ERROR: 'error',
  NOTIFICATION: 'notification'
};
```

## 🤖 Automatizări

### 1. Monitorizare Email-uri Booking.com

```javascript
// Declanșare verificare manuală
ws.send(JSON.stringify({
  type: 'automation_action',
  action: 'BOOKING_EMAIL'
}));

// Primire notificări
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'notification' && data.title === 'Rezervare nouă Booking.com') {
    console.log(data.message); // Afișare notificare
    console.log(data.link);    // Link către detalii
  }
};
```

### 2. Integrare WhatsApp

```javascript
// Declanșare verificare manuală
ws.send(JSON.stringify({
  type: 'automation_action',
  action: 'WHATSAPP_MESSAGE'
}));

// Primire mesaje și răspunsuri
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'notification' && data.title === 'Mesaj WhatsApp nou') {
    console.log(data.message);    // Mesajul original
    console.log(data.aiResponse); // Răspunsul generat de AI
  }
};
```

### 3. Analiză Prețuri

```javascript
// Declanșare analiză manuală
ws.send(JSON.stringify({
  type: 'automation_action',
  action: 'PRICE_ANALYSIS'
}));

// Primire rezultate analiză
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'notification' && data.title === 'Analiză prețuri completă') {
    console.log(data.analysis); // Array cu analiza pe tipuri de camere
    /*
    [
      {
        roomType: "single",
        currentAvgPrice: 200,
        occupancyRate: 75,
        recommendedPrice: 200,
        change: 0
      },
      // ... alte tipuri de camere
    ]
    */
  }
};
```

## 📝 Exemple de Implementare

### Gestionare Generală a Mesajelor

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'notification':
      handleNotification(data);
      break;
      
    case 'reservations_update':
      updateReservationsList(data.reservations);
      break;
      
    case 'chat_response':
      displayChatResponse(data.response);
      break;
      
    case 'error':
      showError(data.message);
      break;
  }
};

function handleNotification(data) {
  switch (data.title) {
    case 'Rezervare nouă Booking.com':
      showBookingNotification(data);
      break;
      
    case 'Mesaj WhatsApp nou':
      showWhatsAppNotification(data);
      break;
      
    case 'Analiză prețuri completă':
      showPriceAnalysis(data.analysis);
      break;
  }
}
```

### Exemplu Componentă React

```javascript
import React, { useEffect, useState } from 'react';

function AutomationDashboard() {
  const [ws, setWs] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [priceAnalysis, setPriceAnalysis] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://your-server/api/chat');
    
    socket.onopen = () => {
      console.log('Conectat la server');
      setWs(socket);
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'notification') {
        setNotifications(prev => [...prev, data]);
        
        if (data.title === 'Analiză prețuri completă') {
          setPriceAnalysis(data.analysis);
        }
      }
    };
    
    return () => {
      socket.close();
    };
  }, []);

  const triggerPriceAnalysis = () => {
    ws.send(JSON.stringify({
      type: 'automation_action',
      action: 'PRICE_ANALYSIS'
    }));
  };

  return (
    <div>
      <h1>Dashboard Automatizări</h1>
      
      <button onClick={triggerPriceAnalysis}>
        Analizează Prețuri
      </button>
      
      {priceAnalysis && (
        <div>
          <h2>Ultima Analiză de Prețuri</h2>
          {priceAnalysis.map(room => (
            <div key={room.roomType}>
              <h3>{room.roomType}</h3>
              <p>Preț curent: {room.currentAvgPrice} RON</p>
              <p>Ocupare: {room.occupancyRate}%</p>
              <p>Preț recomandat: {room.recommendedPrice} RON</p>
              <p>Modificare: {room.change}%</p>
            </div>
          ))}
        </div>
      )}
      
      <div>
        <h2>Notificări Recente</h2>
        {notifications.map((notif, index) => (
          <div key={index}>
            <h3>{notif.title}</h3>
            <p>{notif.message}</p>
            {notif.link && <a href={notif.link}>Vezi detalii</a>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AutomationDashboard;
```

## ⚠️ Note Importante

1. Verificările automate sunt pornite la conectarea clientului:
   - Email-uri Booking.com: la fiecare 5 minute
   - Mesaje WhatsApp: la fiecare 2 minute
   - Analiză prețuri: o dată pe zi

2. Toate mesajele trimise și primite trebuie să fie în format JSON și serializate folosind `JSON.stringify()`.

3. Gestionați întotdeauna erorile și reconectarea în caz de deconectare.

4. Pentru mesajele de tip notificare, verificați întotdeauna `data.title` pentru a determina tipul specific de notificare.

5. Datele de analiză a prețurilor includ informații despre ocupare și recomandări de preț pentru fiecare tip de cameră. 