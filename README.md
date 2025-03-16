# Arhitectura WebSocket pentru Hotel Management System

## Prezentare Generală

Sistemul utilizează o arhitectură modernă bazată pe WebSocket (biblioteca ws) pentru comunicarea în timp real între client și server. La baza acestei arhitecturi stă un sistem de procesare a intențiilor (intents) care permite aplicației să răspundă la diverse comenzi în limbaj natural.

Arhitectura este organizată în jurul următoarelor concepte cheie:

- **WebSocket** - protocol pentru comunicare bidirecțională în timp real
- **Intent Handlers** - handleri specializați pentru procesarea diferitelor tipuri de intenții
- **Callback-based Messaging** - o abordare unde fiecare handler primește un callback pentru a trimite răspunsul
- **NLP Service** - serviciu pentru procesarea limbajului natural și extragerea intențiilor și entităților

## Sincronizarea Rezervărilor în Timp Real

Pe lângă procesarea intențiilor, sistemul include și un mecanism de sincronizare a rezervărilor în timp real. Acest mecanism este implementat prin `reservationController.js` și permite actualizarea automată a datelor pentru toți clienții conectați.

### Componente pentru Sincronizarea Rezervărilor

```
server/
├── socket/
│   ├── controllers/
│   │   ├── chatController.js      # Controller pentru mesaje de chat
│   │   └── reservationController.js # Controller pentru sincronizarea rezervărilor
│   ├── services/
│   │   └── reservationService.js  # Servicii pentru obținerea și procesarea rezervărilor
```

### Funcționalități de Sincronizare

Sistemul oferă două funcționalități principale pentru sincronizarea rezervărilor:

1. **Inițializarea Datelor** - La conectare, clientul primește toate rezervările active
2. **Actualizări în Timp Real** - Când se modifică o rezervare, toți clienții conectați primesc actualizări

### Flux de Sincronizare a Rezervărilor

```
┌─────────────┐
│   Client    │◄───────────────┐
└──────┬──────┘                │
       │                       │
       │ Conectare             │ Actualizări în
       │                       │ timp real
       ▼                       │
┌─────────────┐          ┌─────┴───────┐
│  WebSocket  │          │  Bază de    │
└──────┬──────┘          │  Date       │
       │                 └─────┬───────┘
       │                       │
       ▼                       │
┌─────────────────────────────┐│
│ reservationController.js    ││
├─────────────────────────────┘│
│                              │
│ 1. sendActiveReservationsToClient  
│    - Trimite toate rezervările active
│    - Apelat la conectarea clientului 
│                              │
│ 2. emitReservationsUpdate    │
│    - Actualizează toți clienții
│    - Apelat când apar modificări
└──────────────────────────────┘
```

### Protocol pentru Actualizări de Rezervări

Serverul trimite actualizări printr-un mesaj WebSocket formatat:

```javascript
ws.send(JSON.stringify({
  type: "RESERVATIONS_UPDATE",
  action: "init",  // sau "sync" pentru actualizări incrementale
  reservations: [
    // Array de obiecte rezervare
  ]
}));
```

### Integrarea cu Clienții

Clienții trebuie să implementeze un handler pentru mesajele WebSocket de tip `RESERVATIONS_UPDATE`:

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === "RESERVATIONS_UPDATE") {
    if (data.action === "init") {
      // Inițializare completă a datelor
      initializeReservations(data.reservations);
    } else if (data.action === "sync") {
      // Actualizare incrementală
      updateReservations(data.reservations);
    }
  }
};
```

## Structura Directorială

```
server/
├── socket/
│   ├── index.js               # Punct de intrare principal pentru WebSocket
│   ├── actions/
│   │   ├── actionHandler.js   # Processor pentru mesaje
│   │   └── connectionHandler.js # Handler pentru conexiuni WebSocket
│   ├── controllers/
│   │   ├── chatController.js      # Controller pentru mesaje de chat
│   │   ├── automationController.js # Controller pentru automatizări
│   │   └── reservationController.js # Controller pentru sincronizarea rezervărilor
│   ├── intentHandlers/
│   │   ├── index.js             # Maparea intențiilor la handleri
│   │   ├── defaultHandler.js    # Handler implicit
│   │   ├── reservationHandler.js # Handler pentru rezervări noi
│   │   ├── modifyReservationHandler.js # Handler pentru modificare rezervări
│   │   ├── posHandler.js        # Handler pentru operațiuni POS
│   │   └── uiHandlers.js        # Handleri pentru operațiuni UI
│   ├── services/
│   │   ├── chatService.js       # Serviciu pentru procesarea mesajelor
│   │   ├── nlpService.js        # Serviciu pentru procesarea limbajului natural
│   │   └── reservationService.js # Serviciu pentru operațiuni cu rezervări
│   └── utils/
│       └── messageTypes.js      # Constante pentru tipuri de mesaje și intenții
└── index.js                     # Server principal
```

## Fluxul de Procesare a Mesajelor

1. **Primirea Mesajului** - Un mesaj de chat este primit de la client prin WebSocket
2. **Connection Handler** (`connectionHandler.js`) - Gestionează conexiunea WebSocket și rutarea mesajelor
3. **Action Handler** (`actionHandler.js`) - Procesează mesajele și le direcționează către handlerii corespunzători
4. **Procesare Intent** (`chatService.js`) - Serviciul apelează NLP pentru a identifica intenția și entitățile
5. **Selecție Handler** - Se selectează handlerul potrivit pentru intenția detectată
6. **Execuție Handler** - Handlerul procesează entitățile și construiește răspunsul
7. **Trimitere Răspuns** - Handlerul apelează callback-ul pentru a trimite răspunsul direct către client

## Protocolul de Comunicare

### Mesaje de la Client la Server

Clientul trimite mesaje text prin WebSocket:

```javascript
ws.send(JSON.stringify({
  type: "CHAT_MESSAGE",
  content: "Rezervă camera 101 de la 15 mai până la 20 mai"
}));
```

### Răspunsuri de la Server la Client

Serverul trimite răspunsuri prin mesaje WebSocket cu următoarea structură:

```javascript
{
  type: "CHAT_RESPONSE",
  response: {
    intent: "INTENT_TYPE",       // Tipul intenției (e.g., RESERVATION, SHOW_CALENDAR)
    type: "RESPONSE_TYPE",       // Tipul răspunsului (e.g., ACTION, ERROR, MESSAGE)
    message: "Mesaj pentru utilizator",
    extraIntents: [],            // Intenții adiționale
    reservation: {               // Date specifice intenției (opțional)
      // ...
    }
  }
}
```

## Tipuri de Intenții Suportate

- `RESERVATION` - Crearea unei noi rezervări
- `MODIFY_RESERVATION` - Modificarea unei rezervări existente
- `SHOW_CALENDAR` - Afișarea calendarului
- `SHOW_STOCK` - Afișarea stocului
- `SHOW_REPORTS` - Afișarea rapoartelor
- `SHOW_INVOICES` - Afișarea facturilor
- `SHOW_POS` - Afișarea modulului POS
- `SELL_PRODUCT` - Vânzarea unui produs
- `DEFAULT` - Intenție implicită pentru cazuri nerecunoscute

## Tipuri de Răspunsuri

- `ACTION` - Răspuns care declanșează o acțiune în interfață
- `ERROR` - Răspuns de eroare
- `MESSAGE` - Răspuns textual simplu
- `FORM` - Răspuns care deschide un formular

## Handleri de Intenții

Fiecare handler de intenție urmează același model:

```javascript
const handleIntent = (entities, extraIntents, sendResponse) => {
  // Procesare entități
  
  // Construire răspuns
  const response = {
    intent: CHAT_INTENTS.INTENT_TYPE,
    type: RESPONSE_TYPES.RESPONSE_TYPE,
    message: "Mesaj",
    extraIntents: extraIntents || [],
    // Date adiționale specifice intenției
  };
  
  // Trimitere răspuns
  sendResponse(response);
};
```

## Avantajele Arhitecturii

1. **Modularitate** - Fiecare handler este izolat și poate fi dezvoltat independent
2. **Control Direct** - Handlerii au control direct asupra răspunsului trimis
3. **Simplitate** - Fluxul de procesare a fost simplificat prin eliminarea nivelurilor intermediare
4. **Extensibilitate** - Adăugarea de noi intenții se face simplu prin crearea unui nou handler
5. **Robustețe** - Implementarea WebSocket oferă o conexiune persistentă pentru comunicare în timp real
6. **Comunicare Bidirecțională** - Sistemul permite atât comenzi de la client, cât și notificări automate de la server
7. **Arhitectură Centralizată** - Fișierul `index.js` acționează ca punct unic de intrare pentru modulul de socket

## Exemplu de Integrare Client

```javascript
// Conectare la server
const ws = new WebSocket("ws://localhost:5000/api/chat");

// Handler pentru mesaje primite
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  // Verificarea tipului de mesaj
  if (data.type === "CHAT_RESPONSE") {
    const response = data.response;
    console.log("Răspuns primit:", response);
    
    // Procesare răspuns în funcție de tip
    switch (response.type) {
      case "ACTION":
        // Declanșează o acțiune în UI
        break;
      case "ERROR":
        // Afișează eroarea
        break;
      case "MESSAGE":
        // Afișează mesajul
        break;
      // ...
    }
  } else if (data.type === "RESERVATIONS_UPDATE") {
    // Procesare actualizări de rezervări
    if (data.action === "init") {
      // Inițializarea rezervărilor
      initReservations(data.reservations);
    } else if (data.action === "sync") {
      // Actualizare rezervări
      updateReservations(data.reservations);
    }
  }
};

// Trimiterea unui mesaj
function sendMessage(message) {
  ws.send(JSON.stringify({
    type: "CHAT_MESSAGE",
    content: message
  }));
}
```

## Diagrama Fluxului de Date

```
Client ─────┐                                      ┌───── Client
            │                                      │
            ▼                                      │
┌─────────────────────┐                           │
│    socket/index.js  │                           │
└─────────┬───────────┘                           │
          │                                       │
          ▼                                       │
┌─────────────────────┐                           │
│ connectionHandler.js│                           │
└─────────┬───────────┘                           │
          │                                       │
          ▼                                       │
┌─────────────────────┐                           │
│  actionHandler.js   │                           │
└─────────┬───────────┘                           │
          │                                       │
          ▼                                       │
┌─────────────────────┐                           │
│    nlpService.js    │                           │
└─────────┬───────────┘                           │
          │                                       │
          ▼                                       │
┌─────────────────────┐    ┌───────────────────┐  │
│  getIntentHandler   ├───►│ Intent Handler    ├──┘
└─────────────────────┘    └───────────────────┘
```

## Exemple de Comunicare

### Client → Server (Chat)
```json
{
  "type": "CHAT_MESSAGE",
  "content": "Rezervă camera 101 de la 15 mai până la 20 mai"
}
```

### Server → Client (Răspuns Chat)
```json
{
  "type": "CHAT_RESPONSE",
  "response": {
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

### Server → Client (Actualizare Rezervări)
```json
{
  "type": "RESERVATIONS_UPDATE",
  "action": "sync",
  "reservations": [
    {
      "id": 1,
      "roomNumber": "101",
      "startDate": "2023-05-15",
      "endDate": "2023-05-20",
      "guestName": "Ion Popescu",
      "status": "confirmed"
    },
    // ...alte rezervări
  ]
}
```

## Extinderea Sistemului

Pentru a adăuga o nouă intenție:

1. Adaugă noul tip de intenție în `messageTypes.js`
2. Creează un handler pentru noua intenție
3. Înregistrează handlerul în `intentHandlers/index.js`
4. Asigură-te că serviciul NLP poate detecta noua intenție

## Gestionarea Erorilor

Erorile sunt gestionate la fiecare nivel al arhitecturii:

1. **Connection Level** - Erori de comunicare WebSocket și conexiune
2. **Action Level** - Erori de procesare a mesajelor
3. **Service Level** - Erori de procesare a intențiilor
4. **Handler Level** - Erori specifice handlerului
5. **Reservation Level** - Erori de sincronizare a rezervărilor

Toate erorile sunt raportate clientului într-un format standardizat.

## Arhitectura Unitară

Deși procesarea comenzilor de chat și sincronizarea rezervărilor urmează fluxuri diferite, ele sunt integrate într-o arhitectură unitară folosind WebSocket. Acest lucru permite:

1. **Conexiune Unică** - O singură conexiune WebSocket pentru toate tipurile de comunicare
2. **Independență Funcțională** - Fluxurile de procesare sunt independente dar partajează aceeași infrastructură
3. **Eficiență** - Minimizarea resurselor și overhead-ului de comunicare

## Implementarea WebSocket

Sistemul folosește biblioteca WebSocket nativă (`ws`) pentru gestionarea conexiunilor. Aceasta oferă o implementare eficientă și de joasă latență a protocolului WebSocket:

```javascript
// Inițializare server WebSocket
const WebSocket = require('ws');
const { handleConnection } = require('./actions/connectionHandler');

const initSocket = () => {
  const wss = new WebSocket.Server({ noServer: true });
  
  // Gestionarea conexiunilor folosind handlerul specializat
  wss.on('connection', handleConnection);
  
  return wss;
};
```

## Note de Implementare

- Această arhitectură este optimizată pentru un sistem de chat cu intenții predefinite
- Pentru sisteme cu dialog complex, se poate extinde cu un manager de conversație
- Biblioteca WebSocket (`ws`) oferă performanță ridicată și consum redus de resurse
- Actualizările de rezervări pot fi optimizate pentru a trimite doar modificările, nu setul complet de date
- Separarea clară între inițializarea socketului și gestionarea conexiunilor oferă o mai bună modularitate și testabilitate