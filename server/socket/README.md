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
│   ├── roomHandler.js           # Procesează intenții legate de camere
│   └── uiHandlers.js            # Procesează intenții legate de interfața utilizator
├── services/                # Servicii reutilizabile pentru funcționalități WebSocket
│   ├── automationService.js     # Serviciu pentru automatizări
│   ├── chatService.js           # Serviciu pentru funcționalități de chat
│   └── reservationService.js    # Serviciu pentru gestionarea rezervărilor
├── utils/                   # Utilități și constante
│   └── messageTypes.js      # Definește tipurile de mesaje utilizate în comunicare
├── index.js                 # Punctul de intrare principal care expune API-ul modulului
└── webSocket.js             # Configurare core a serverului WebSocket
```

## Descrierea componentelor principale

### index.js
Punctul central de acces la modulul de socket care expune toate funcționalitățile și constantele necesare pentru a fi utilizate de restul aplicației.

### webSocket.js
Configurează și inițializează serverul WebSocket, oferind funcționalități de bază pentru gestionarea conexiunilor și notificări. Expune funcția `notifyReservationChange` care este folosită pentru a anunța toți clienții despre modificări în rezervări.

### actions/
Conține logica de procesare a mesajelor și conexiunilor primite prin WebSocket:
- **connectionHandler.js**: Gestionează ciclul de viață al conexiunilor (conectare, deconectare, tracking)
  - Menține o colecție de clienți conectați (`clients`)
  - Trimite rezervările active noilor clienți conectați
  - Configurează verificările automate pentru fiecare client
- **actionHandler.js**: Direcționează mesajele primite către handlerii corespunzători

### controllers/
Implementează logica de business pentru diferite zone funcționale și orchestrează comunicarea între clienți și servicii:
- **chatController.js**: Procesează și răspunde la mesajele de chat
- **reservationController.js**: Gestionează operațiunile cu rezervările
  - `sendActiveReservationsToClient`: Trimite rezervările active către un client specific
  - `emitReservationsUpdate`: Distribuie actualizări despre rezervări către toți clienții
- **automationController.js**: Implementează funcționalități automate (procesare comenzi, notificări)

### services/
Servicii reutilizabile care conțin logica de business și interacționează cu baza de date:
- **chatService.js**: Funcționalități legate de procesarea mesajelor
- **automationService.js**: Servicii pentru automatizarea proceselor hoteliere
- **reservationService.js**: Gestionează datele și operațiile cu rezervări
  - `formatReservation`: Formatează datele rezervărilor pentru transmitere
  - `getActiveReservations`: Obține toate rezervările active din baza de date
  - `sendReservationsUpdateMessage`: Trimite mesaje către unul sau mai mulți clienți

### intentHandlers/
Procesează intențiile utilizatorilor detectate prin NLP:
- **index.js**: Direcționează intențiile către handlerii specifici și asigură formatul standard de răspuns
- **roomHandler.js**: Procesează intenții legate de camere și ocupare
- **reservationHandler.js**: Procesează intenții pentru crearea rezervărilor
- **modifyReservationHandler.js**: Gestionează modificările de rezervări
- **phoneHandler.js**: Procesează intenții legate de numere de telefon
- **posHandler.js**: Procesează intenții legate de puncte de vânzare
- **uiHandlers.js**: Procesează intenții legate de interfața utilizator (calendar, rapoarte, etc.)
- **defaultHandler.js**: Handler implicit pentru intenții nerecunoscute

Toți handlerele de intenții returnează un obiect de răspuns cu următoarea structură:
```javascript
{
  intent: string,             // Intenția detectată
  message: string,            // Mesajul de răspuns
  entities: Object,           // Entitățile extrase din mesaj
  extraIntents: Array,        // Intențiile adiționale detectate
  type: string,               // Tipul de răspuns (ACTION, FORM, OPTIONS, etc.)
  // ... alte proprietăți specifice fiecărui tip de răspuns
}
```

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

## Flow de date pentru actualizări de rezervări

1. O modificare în rezervări este realizată în sistem
2. Aplicația apelează `notifyReservationChange()` pentru a distribui modificările
3. Funcția apelează `emitReservationsUpdate(clients)` din controllerul de rezervări
4. Controllerul obține rezervările active prin `getActiveReservations()` din serviciul de rezervări
5. Datele rezervărilor sunt formatate și trimise către toți clienții conectați prin `sendReservationsUpdateMessage()`
6. Clienții primesc mesajul de actualizare și își actualizează interfața

## Flow de date pentru procesarea intențiilor

1. Un client trimite un mesaj text prin WebSocket
2. Mesajul este preluat de `actionHandler.js` și trimis către `chatController.js`
3. Controller-ul detectează intenția și entitățile folosind NLP și apelează `processIntent()`
4. Funcția `processIntent()` din `intentHandlers/index.js` identifică handler-ul potrivit
5. Handler-ul procesează intenția și entitățile, și returnează un obiect de răspuns standardizat
6. Obiectul de răspuns este trimis înapoi clientului, care actualizează interfața în funcție de tipul răspunsului

## Flow de date pentru conexiunea unui client nou

1. Un client se conectează la server prin WebSocket
2. Conexiunea este gestionată de `handleConnection()` din `connectionHandler.js`
3. Clientul este adăugat în lista de clienți activi
4. `sendActiveReservationsToClient()` este apelat pentru a trimite rezervările active
5. Controllerul de rezervări obține datele prin `getActiveReservations()`
6. Rezervările sunt trimise clientului prin `sendReservationsUpdateMessage()`

## Extindere

Pentru a adăuga noi funcționalități:

1. Adaugă noi tipuri de mesaje în `utils/messageTypes.js`
2. Implementează noi servicii în directorul `services/` pentru a gestiona logica de business
3. Implementează noi controllere în directorul `controllers/` pentru a orchestra serviciile
4. Adaugă noi handlere de intenții în `intentHandlers/` pentru funcționalități specifice NLP
5. Actualizează `actions/actionHandler.js` pentru a direcționa mesajele către noile controllere
6. Exportă noile funcționalități prin `index.js` 