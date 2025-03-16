const natural = require('natural');

// Regex-uri pentru diferite formate de date
const datePatterns = [
  // Format: 11-13 mar, 24-26 decembrie (interval în aceeași lună)
  /\b(\d{1,2})[-\s](\d{1,2})[-\s](ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie|ian|feb|mar|apr|iun|iul|aug|sep|oct|nov|dec)\b/gi,
  
  // Format: 11 mar - 13 mar (interval posibil în luni diferite)
  /\b(\d{1,2})[-\s](ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie|ian|feb|mar|apr|iun|iul|aug|sep|oct|nov|dec)(?:[-\s]?(?:pana|pana la|la)[-\s])?(\d{1,2})[-\s](ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie|ian|feb|mar|apr|iun|iul|aug|sep|oct|nov|dec)\b/gi,
  
  // Format: 24.12-26.12, 24.12.2024
  /\b(\d{1,2})[.](\d{1,2})(?:[.](\d{4}))?(?:[-\s](?:pana|pana la|la)[-\s])?(\d{1,2})[.](\d{1,2})(?:[.](\d{4}))?\b/g,
  
  // Format: pentru 3 nopti
  /\b(?:pentru|timp de)[-\s](\d{1,2})[-\s]?(?:nopti|zile)\b/gi,
  
  // Format: O singură dată cu lună text (ex: 24 decembrie, 24 dec)
  /\b(\d{1,2})[-\s](ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie|ian|feb|mar|apr|iun|iul|aug|sep|oct|nov|dec)(?:\s(\d{4}))?\b/gi
];

const monthMap = {
  ianuarie: "01", februarie: "02", martie: "03", aprilie: "04", mai: "05", iunie: "06",
  iulie: "07", august: "08", septembrie: "09", octombrie: "10", noiembrie: "11", decembrie: "12",
  ian: "01", feb: "02", mar: "03", apr: "04", iun: "06",
  iul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
};

const normalizeText = (text) => {
  // Convertim la lowercase și eliminăm diacriticele
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const createDate = (day, month, year = new Date().getFullYear()) => {
  const date = new Date(year, parseInt(month) - 1, parseInt(day));
  // Verificăm dacă data este validă
  if (isNaN(date.getTime())) {
    throw new Error(`Data invalidă: ${day}/${month}/${year}`);
  }
  return date;
};

const extractDates = (message) => {
  const today = new Date();
  let extractedDates = [];

  const normalizedMessage = normalizeText(message);
  console.log("🔍 Mesaj normalizat:", normalizedMessage);

  for (let pattern of datePatterns) {
    let matches = [...normalizedMessage.matchAll(pattern)];
    
    for (let match of matches) {
      try {
        let startDate, endDate;
        console.log("📌 Match găsit:", match);
        
        if (match[0].includes('nopti') || match[0].includes('zile')) {
          // Cazul "pentru X nopți"
          const nights = parseInt(match[1]);
          startDate = new Date();
          endDate = new Date();
          endDate.setDate(endDate.getDate() + nights);
        } else if (match[0].includes('.')) {
          // Format: DD.MM sau DD.MM.YYYY
          const startDay = match[1];
          const startMonth = match[2];
          const startYear = match[3] || today.getFullYear();
          startDate = createDate(startDay, startMonth, startYear);

          if (match[4]) {
            const endDay = match[4];
            const endMonth = match[5];
            const endYear = match[6] || startYear;
            endDate = createDate(endDay, endMonth, endYear);
          } else {
            // Pentru o singură dată, adăugăm automat ziua următoare ca dată de sfârșit
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
          }
        } else {
          // Format cu lună text
          const startDay = match[1];
          
          // Verificăm dacă avem un format de interval sau o singură dată
          if (match[2] && match[3] && !monthMap[match[3]]) {
            // Format: DD-DD Month (interval in aceeași lună)
            const endDay = match[2];
            const month = monthMap[match[3]];
            
            startDate = createDate(startDay, month);
            endDate = createDate(endDay, month);
            
            // Dacă data de sfârșit e mai mică, presupunem luna următoare
            if (endDate < startDate) {
              endDate.setMonth(endDate.getMonth() + 1);
            }
          } else if (monthMap[match[2]] && match[3] && monthMap[match[4]]) {
            // Format: DD Month - DD Month (interval în luni diferite)
            const startMonth = monthMap[match[2]];
            const endDay = match[3];
            const endMonth = monthMap[match[4]];
            
            startDate = createDate(startDay, startMonth);
            endDate = createDate(endDay, endMonth);
            
            // Dacă data de sfârșit e mai mică și lunile sunt diferite, presupunem anul următor
            if (endDate < startDate && endMonth <= startMonth) {
              endDate.setFullYear(endDate.getFullYear() + 1);
            }
          } else if (monthMap[match[2]]) {
            // Format: O singură dată (ex: 24 decembrie)
            const month = monthMap[match[2]];
            const year = match[3] || today.getFullYear();
            
            startDate = createDate(startDay, month, year);
            
            // Pentru o singură dată, adăugăm automat ziua următoare ca dată de sfârșit
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
          }
        }

        if (!startDate || isNaN(startDate.getTime())) {
          console.error("❌ Data de început invalidă:", match[0]);
          continue;
        }

        const formatDate = (date) => date.toISOString().split('T')[0];
        const dateEntry = {
          startDate: formatDate(startDate),
          endDate: endDate && !isNaN(endDate.getTime()) ? formatDate(endDate) : null
        };

        console.log("📅 Date extrase:", dateEntry);
        extractedDates.push(dateEntry);
      } catch (error) {
        console.error("❌ Eroare la procesarea datei:", match[0], error);
        continue;
      }
    }
  }

  return extractedDates;
};

module.exports = extractDates;