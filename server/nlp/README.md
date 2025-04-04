# NLP (Natural Language Processing) Module

Acest modul se ocupă de procesarea limbajului natural pentru a înțelege și răspunde la comenzile utilizatorilor în sistemul de hotel.

## Structura Modulului

```
/nlp
├── core/               # Componente de bază NLP
│   ├── nlpService.js   # Serviciul principal NLP
│   └── patternMatcher.js # Matcher pentru pattern-uri
├── extractors/         # Extractoare de entități
│   ├── dateExtractor.js    # Extrage date și perioade
│   ├── intentExtractor.js  # Extrage intențiile
│   ├── productExtractor.js # Extrage produse și cantități
│   ├── roomExtractor.js    # Extrage informații despre camere
│   └── index.js            # Coordonator pentru extractoare
├── config/             # Configurări
│   ├── nlpConfig.js    # Configurări generale NLP
│   └── intentPatterns.js # Pattern-uri pentru intenții
├── utils/              # Utilități
│   ├── memoryUtils.js  # Gestionare memorie
│   └── textUtils.js    # Procesare text
└── index.js            # Punct de intrare modul
```

## Componente Principale

### 1. Core NLP

#### nlpService.js
- Serviciul principal pentru procesarea mesajelor
- Gestionează cache-ul și memoria
- Coordonează detectarea intenției și extragerea entităților
- Implementează procesare de rezervă pentru situații de memorie critică

#### patternMatcher.js
- Detectează intențiile din mesaje
- Implementează procesare de rezervă
- Gestionează pattern-uri pentru diferite tipuri de comenzi

### 2. Extractoare

#### dateExtractor.js
- Extrage date și perioade din text
- Suportă formate:
  - Date specifice (ex: "14 apr", "18 mai")
  - Intervale de date (ex: "14-18 mai")
  - Referințe relative (ex: "azi", "mâine")
  - Referințe la luni (ex: "luna aceasta")
  - Referințe la săptămâni (ex: "saptamana aceasta")

#### intentExtractor.js
- Detectează intențiile din mesaje
- Suportă comenzi scurte și complexe
- Pattern-uri pentru:
  - Rezervări
  - Adăugare camere
  - Adăugare telefoane
  - Probleme camere
  - Vânzări produse

#### productExtractor.js
- Extrage produse și cantități
- Suportă:
  - Nume de produse compuse
  - Cantități cu unități (ex: "2 bucăți", "3 pachete")
  - Cantități zecimale
  - Valori implicite (1 dacă nespecificat)

#### roomExtractor.js
- Extrage informații despre camere
- Suportă:
  - Coduri camere (ex: "c301", "c104")
  - Tipuri camere (ex: "single", "double", "twin")
  - Prețuri
  - Probleme

### 3. Configurări

#### nlpConfig.js
- Configurări pentru:
  - Limite de memorie
  - Dimensiuni cache
  - Timp de expirare cache
  - Praguri de confidență

#### intentPatterns.js
- Pattern-uri pentru detectarea intențiilor
- Rute rapide pentru comenzi comune
- Pattern-uri pentru comenzi scurte

### 4. Utilități

#### memoryUtils.js
- Gestionează utilizarea memoriei
- Implementează curățare cache
- Monitorizează utilizarea memoriei

#### textUtils.js
- Normalizează text
- Procesează text pentru analiză
- Gestionează diacritice și formate

## Utilizare

### Procesare Mesaj

```javascript
const { analyzeMessage } = require('./nlp');

// Procesare mesaj
const result = await analyzeMessage("rezervare Mihai Ionut dubla 14 apr");

// Rezultat
{
  intent: "RESERVATION",
  entities: {
    name: "Mihai Ionut",
    roomType: "double",
    dates: ["2024-04-14"]
  },
  confidence: 0.95,
  message: "✅ Rezervare creată cu succes!"
}
```

### Exemple de Comenzi

1. Rezervări:
   - "rezervare Mihai Ionut dubla 14 apr"
   - "c204 18 mai"

2. Camere:
   - "adauga cam c301 twin 600 lei"
   - "tel c104 0793002911"

3. Produse:
   - "vinde 2 bucati bere"
   - "3 pachete tigari"

## Gestionare Memorie

- Cache-ul este limitat la 1000 de intrări
- TTL (Time To Live) de 1 oră pentru cache
- Curățare automată când se atinge limita
- Procesare de rezervă pentru situații de memorie critică

## Best Practices

1. Folosiți comenzi scurte și directe
2. Specificați toate detaliile necesare
3. Folosiți formate standard pentru date
4. Evitați mesaje prea lungi (>1000 caractere)

## Limitări

1. Mesajele sunt trunchiate la 1000 de caractere
2. Cache-ul are o limită de 1000 de intrări
3. Procesarea de rezervă este activată la utilizare critică a memoriei
4. Suport limitat pentru limbaj natural complex 