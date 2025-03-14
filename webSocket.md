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

### 1. Procesare Automată Rezervări Booking.com

```javascript
// Declanșare verificare manuală
ws.send(JSON.stringify({
  type: 'automation_action',
  action: 'BOOKING_EMAIL'
}));

// Primire notificări
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'notification') {
    switch (data.title) {
      case 'Rezervare automată completată':
        console.log('Rezervare procesată:', data.reservationDetails);
        // Afișare detalii rezervare
        break;
      case 'Rezervare automată eșuată':
        console.log('Eroare rezervare:', data.message);
        console.log('Date originale:', data.originalData);
        // Afișare formular manual
        break;
    }
  }
};
```

### 2. Procesare Automată Mesaje WhatsApp

```javascript
// Declanșare verificare manuală
ws.send(JSON.stringify({
  type: 'automation_action',
  action: 'WHATSAPP_MESSAGE'
}));

// Primire notificări
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'notification') {
    switch (data.title) {
      case 'Rezervare WhatsApp procesată':
        console.log('Mesaj confirmare:', data.message);
        console.log('Detalii rezervare:', data.reservationDetails);
        break;
      case 'Rezervare WhatsApp eșuată':
        console.log('Eroare procesare:', data.message);
        console.log('Date extrase:', data.originalData);
        break;
    }
  }
};
```

### 3. Propuneri Ajustare Prețuri

```javascript
// Declanșare analiză manuală
ws.send(JSON.stringify({
  type: 'automation_action',
  action: 'PRICE_ANALYSIS'
}));

// Primire propuneri
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'notification' && data.title === 'Propuneri de ajustare prețuri') {
    console.log('Propuneri primite:', data.proposals);
    /*
    [
      {
        roomType: "single",
        currentStats: {
          avgPrice: 200,
          occupancyRate: 75,
          totalBookings: 45
        },
        proposals: [
          {
            price: 220,
            justification: "Creștere cu 10% datorită ocupării ridicate și cererii constante"
          },
          {
            price: 190,
            justification: "Reducere strategică pentru a stimula rezervările în perioadele mai puțin solicitate"
          },
          {
            price: 200,
            justification: "Menținerea prețului actual pentru a păstra competitivitatea"
          }
        ]
      }
    ]
    */
  }
};
```

## 📝 Exemplu Componentă React pentru Automatizări

```javascript
import React, { useEffect, useState } from 'react';

function AutomationDashboard() {
  const [ws, setWs] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [priceProposals, setPriceProposals] = useState([]);
  const [notifications, setNotifications] = useState([]);

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
        
        switch (data.title) {
          case 'Rezervare automată completată':
          case 'Rezervare WhatsApp procesată':
            setReservations(prev => [...prev, data.reservationDetails]);
            break;
            
          case 'Propuneri de ajustare prețuri':
            setPriceProposals(data.proposals);
            break;
        }
      }
    };
    
    return () => {
      socket.close();
    };
  }, []);

  const applyPriceProposal = (roomType, proposal) => {
    // Implementare actualizare preț
    console.log(`Aplicare propunere pentru ${roomType}:`, proposal);
  };

  return (
    <div>
      <h1>Dashboard Automatizări</h1>
      
      <section>
        <h2>Rezervări Automate Recente</h2>
        {reservations.map((reservation, index) => (
          <div key={index} className="reservation-card">
            <h3>{reservation.fullName}</h3>
            <p>Camera: {reservation.rooms[0].roomNumber}</p>
            <p>Check-in: {new Date(reservation.startDate).toLocaleDateString()}</p>
            <p>Check-out: {new Date(reservation.endDate).toLocaleDateString()}</p>
          </div>
        ))}
      </section>
      
      <section>
        <h2>Propuneri de Preț</h2>
        {priceProposals.map((item, index) => (
          <div key={index} className="price-proposal-card">
            <h3>Camera {item.roomType}</h3>
            <div className="current-stats">
              <p>Preț mediu actual: {item.currentStats.avgPrice} RON</p>
              <p>Grad de ocupare: {item.currentStats.occupancyRate}%</p>
              <p>Rezervări totale: {item.currentStats.totalBookings}</p>
            </div>
            <div className="proposals">
              {item.proposals.map((proposal, pIndex) => (
                <div key={pIndex} className="proposal">
                  <p>Propunere {pIndex + 1}: {proposal.price} RON</p>
                  <p>{proposal.justification}</p>
                  <button onClick={() => applyPriceProposal(item.roomType, proposal)}>
                    Aplică acest preț
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      
      <section>
        <h2>Notificări Recente</h2>
        {notifications.map((notif, index) => (
          <div key={index} className="notification">
            <h3>{notif.title}</h3>
            <p>{notif.message}</p>
            <small>{new Date(notif.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </section>
    </div>
  );
}

export default AutomationDashboard;
```

## ⚠️ Note Importante

1. Procesarea Automată a Rezervărilor:
   - Sistemul verifică automat disponibilitatea camerelor
   - Creează rezervări automat când este posibil
   - Trimite notificări de succes sau eșec
   - În caz de eșec, oferă datele extrase pentru procesare manuală

2. Propuneri de Preț:
   - Sistemul generează 3 propuneri diferite pentru fiecare tip de cameră
   - Fiecare propunere include justificare detaliată
   - Propunerile pot fi aplicate individual
   - Analiza ia în considerare ocuparea reală și istoricul prețurilor

3. Verificări Automate:
   - Email-uri Booking.com: la fiecare 5 minute
   - Mesaje WhatsApp: la fiecare 2 minute
   - Analiză prețuri: o dată pe zi

4. Securitate:
   - Toate mesajele sunt validate înainte de procesare
   - Datele sensibile sunt filtrate din notificări
   - Se recomandă implementarea unui sistem de autentificare pentru acces 