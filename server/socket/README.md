# Socket Module - Hotel Management System

Acest modul implementează funcționalitățile de WebSocket pentru comunicarea în timp real între server și clienți în aplicația de management hotelier.

## Structura directorului

```
socket/
├── actions/                 # Handlere pentru acțiuni și conexiuni
│   ├── actionHandler.js     # Procesează acțiunile primite de la clienți
│   └── connectionHandler.js # Gestionează conexiunile de WebSocket
├── controllers/             # Logica de business pentru diferite funcționalități
│   ├── automationController.js  # Controlează funcționalitățile de automatizare
│   ├── chatController.js        # Gestionează mesajele de chat
│   └── reservationController.js # Gestionează operațiile cu rezervări
├── intentHandlers/          # Handlere pentru intenții detectate prin NLP
│   ├── defaultHandler.js        # Handler pentru intenții necunoscute
│   ├── index.js                 # Punctul central pentru toate handlerele de intenții
│   ├── modifyReservationHandler.js  # Modificări de rezervări
│   ├── phoneHandler.js          # Procesează intenții legate de numere de telefon
│   ├── posHandler.js            # Procesează intenții legate de POS
│   ├── reservationHandler.js    # Procesează intenții pentru rezervări noi
│   └── roomHandler.js           # Procesează intenții legate de camere
├── services/                # Servicii reutilizabile pentru funcționalități WebSocket
│   ├── automationService.js     # Serviciu pentru automatizări
│   └── chatService.js           # Serviciu pentru funcționalități de chat
├── utils/                   # Utilități și constante
│   └── messageTypes.js      # Definește tipurile de mesaje utilizate în comunicare
├── index.js                 # Punctul de intrare principal care expune API-ul modulului
└── webSocket.js             # Configurare core a serverului WebSocket
```

## Descrierea componentelor principale

### index.js
Punctul central de acces la modulul de socket care expune toate funcționalitățile și constantele necesare pentru a fi utilizate de restul aplicației.

### webSocket.js
Configurează și inițializează serverul WebSocket, oferind funcționalități de bază pentru gestionarea conexiunilor și notificări.

### actions/
Conține logica de procesare a mesajelor și conexiunilor primite prin WebSocket:
- **connectionHandler.js**: Gestionează ciclul de viață al conexiunilor (conectare, deconectare, tracking)
- **actionHandler.js**: Direcționează mesajele primite către handlerii corespunzători

### controllers/
Implementează logica de business pentru diferite zone funcționale:
- **chatController.js**: Procesează și răspunde la mesajele de chat
- **reservationController.js**: Gestionează operațiunile cu rezervările (creare, modificare, ștergere)
- **automationController.js**: Implementează funcționalități automate (procesare comenzi, notificări)

### intentHandlers/
Procesează intențiile utilizatorilor detectate prin NLP:
- **index.js**: Direcționează intențiile către handlerii specifici
- **roomHandler.js**: Procesează intenții legate de camere și ocupare
- **reservationHandler.js**: Procesează intenții pentru crearea rezervărilor
- **modifyReservationHandler.js**: Gestionează modificările de rezervări
- **phoneHandler.js**: Procesează intenții legate de numere de telefon
- **posHandler.js**: Procesează intenții legate de puncte de vânzare
- **defaultHandler.js**: Handler implicit pentru intenții nerecunoscute

### services/
Servicii reutilizabile pentru diferite componente:
- **chatService.js**: Funcționalități legate de procesarea mesajelor
- **automationService.js**: Servicii pentru automatizarea proceselor hoteliere

### utils/
Utilități, constante și tipuri de date:
- **messageTypes.js**: Definește constantele pentru tipurile de mesaje suportate

## Utilizare

Modulul de socket poate fi importat și utilizat în aplicație astfel:

```javascript
const socketModule = require('./socket');

// Inițializează serverul WebSocket
const wss = socketModule.initSocket();

// Notifică toți clienții despre o schimbare în rezervări
socketModule.notifyReservationChange();

// Accesează lista de clienți conectați
const clients = socketModule.getClients();

// Utilizează constantele pentru tipurile de mesaje
const { messageTypes } = socketModule;
```

## Flow de date

1. Un client se conectează la server prin WebSocket
2. Conexiunea este gestionată de `connectionHandler.js`
3. Mesajele de la client sunt procesate inițial de `actionHandler.js`
4. În funcție de tipul mesajului, este delegat către controllerul corespunzător
5. Pentru mesajele de chat, `chatController.js` analizează textul și determină intenția
6. Intenția este procesată de handlerul potrivit din directorul `intentHandlers/`
7. Răspunsul este trimis înapoi clientului prin conexiunea WebSocket

## Extindere

Pentru a adăuga noi funcționalități:

1. Adaugă noi tipuri de mesaje în `utils/messageTypes.js`
2. Implementează noi controllere în directorul `controllers/` pentru logica specifică
3. Adaugă noi handlere de intenții în `intentHandlers/` pentru funcționalități specifice NLP
4. Actualizează `actions/actionHandler.js` pentru a direcționa mesajele către noile controllere
5. Exportă noile funcționalități prin `index.js` 