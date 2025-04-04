/**
 * Modul pentru extragerea datelor
 */
const { cleanupCache } = require('../utils/memoryUtils');
const { CACHE_SIZE_LIMIT, CACHE_TTL } = require('../config/nlpConfig');

// Cache pentru rezultate
const dateCache = new Map();

// Map pentru luni
const monthMap = {
  'ian': '01', 'feb': '02', 'mar': '03', 'apr': '04',
  'mai': '05', 'iun': '06', 'iul': '07', 'aug': '08',
  'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
};

// Map pentru zile relative
const relativeDayMap = {
  'azi': 0,
  'astazi': 0,
  'astăzi': 0,
  'maine': 1,
  'mâine': 1,
  'poimaine': 2,
  'poimâine': 2,
  'ieri': -1
};

/**
 * Normalizează textul pentru procesare
 * @param {string} text - Textul de normalizat
 * @returns {string} Textul normalizat
 */
function normalizeText(text) {
  // Validare input
  if (!text || typeof text !== 'string') return '';
  if (text.length > 1000) {
    console.warn('⚠️ Message too long, truncating to 1000 characters');
    text = text.substring(0, 1000);
  }
  
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Calculează data pentru o zi relativă
 * @param {string} relativeDay - Ziua relativă (ex: "azi", "maine")
 * @returns {string} Data în format YYYY-MM-DD
 */
function calculateRelativeDate(relativeDay) {
  const today = new Date();
  const daysToAdd = relativeDayMap[relativeDay] || 0;
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysToAdd);
  
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Calculează data pentru o referință relativă la luna curentă
 * @param {string} reference - Referința (ex: "luna aceasta", "luna viitoare")
 * @returns {string} Data în format YYYY-MM-DD
 */
function calculateMonthReference(reference) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let targetMonth = currentMonth;
  let targetYear = currentYear;
  
  if (reference.includes('viitoare') || reference.includes('urmatoare')) {
    targetMonth = (currentMonth + 1) % 12;
    if (targetMonth === 0) targetYear++;
  } else if (reference.includes('trecuta') || reference.includes('anterioara')) {
    targetMonth = (currentMonth - 1 + 12) % 12;
    if (targetMonth === 11) targetYear--;
  }
  
  // Setăm data la începutul lunii
  const targetDate = new Date(targetYear, targetMonth, 1);
  
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Calculează data pentru o referință la săptămână
 * @param {string} reference - Referința (ex: "saptamana aceasta", "saptamana viitoare")
 * @returns {string} Data în format YYYY-MM-DD
 */
function calculateWeekReference(reference) {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Duminică, 1 = Luni, etc.
  const daysUntilMonday = (currentDay === 0) ? 1 : (currentDay === 1) ? 0 : (8 - currentDay);
  
  let daysToAdd = 0;
  
  if (reference.includes('viitoare') || reference.includes('urmatoare')) {
    daysToAdd = 7;
  } else if (reference.includes('trecuta') || reference.includes('anterioara')) {
    daysToAdd = -7;
  }
  
  // Calculăm data pentru luni
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() - daysUntilMonday + daysToAdd);
  
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Extrage datele dintr-un mesaj
 * @param {string} message - Mesajul din care se extrag datele
 * @returns {Array} Array cu obiecte de tip {startDate, endDate}
 */
function extractDates(message) {
  try {
    // Verifică cache-ul
    const cacheKey = message.toLowerCase().trim();
    const cached = dateCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.dates;
    }
    
    // Curăță cache-ul dacă este necesar
    if (dateCache.size >= CACHE_SIZE_LIMIT) {
      cleanupCache(dateCache, CACHE_SIZE_LIMIT, CACHE_TTL);
    }
    
    const normalizedMessage = normalizeText(message);
    const dates = [];
    
    // Pattern pentru zile relative (azi, maine, etc.)
    const relativeDayPattern = /\b(azi|astazi|astăzi|maine|mâine|poimaine|poimâine|ieri)\b/i;
    const relativeDayMatch = normalizedMessage.match(relativeDayPattern);
    if (relativeDayMatch) {
      const relativeDay = relativeDayMatch[1].toLowerCase();
      const date = calculateRelativeDate(relativeDay);
      dates.push({
        startDate: date,
        endDate: null
      });
    }
    
    // Pattern pentru referințe la luna curentă
    const monthReferencePattern = /\b(luna\s+(?:aceasta|viitoare|urmatoare|trecuta|anterioara))\b/i;
    const monthReferenceMatch = normalizedMessage.match(monthReferencePattern);
    if (monthReferenceMatch) {
      const reference = monthReferenceMatch[1].toLowerCase();
      const date = calculateMonthReference(reference);
      dates.push({
        startDate: date,
        endDate: null
      });
    }
    
    // Pattern pentru referințe la săptămână
    const weekReferencePattern = /\b(saptamana\s+(?:aceasta|viitoare|urmatoare|trecuta|anterioara))\b/i;
    const weekReferenceMatch = normalizedMessage.match(weekReferencePattern);
    if (weekReferenceMatch) {
      const reference = weekReferenceMatch[1].toLowerCase();
      const date = calculateWeekReference(reference);
      dates.push({
        startDate: date,
        endDate: null
      });
    }
    
    // Pattern pentru date în formatul "DD LLL" sau "DD LLL YYYY"
    const datePattern = /\b(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?\b/i;
    
    // Pattern pentru perioade "DD LLL - DD LLL" sau "DD LLL pana DD LLL"
    const periodPattern = /\b(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?\s*(?:-|pana|până)\s*(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?\b/i;
    
    // Pattern pentru perioade cu număr de nopți "X nopti din DD LLL"
    const nightsPattern = /\b(\d+)\s+nopti?\s+(?:din|de la)\s+(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?\b/i;
    
    // Pattern pentru date scurte (ex: "14 apr", "18 mai")
    const shortDatePattern = /\b(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)\b/i;
    
    // Pattern pentru intervale scurte (ex: "14-18 mai")
    const shortRangePattern = /\b(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)\b/i;
    
    // Extragem intervale scurte
    let match;
    while ((match = shortRangePattern.exec(normalizedMessage)) !== null) {
      const startDay = match[1].padStart(2, '0');
      const endDay = match[2].padStart(2, '0');
      const month = monthMap[match[3].toLowerCase()];
      const year = new Date().getFullYear().toString();
      
      // Verificăm dacă data de sfârșit este înainte de data de început
      const startDate = new Date(`${year}-${month}-${startDay}`);
      const endDate = new Date(`${year}-${month}-${endDay}`);
      
      if (endDate < startDate) {
        // Dacă data de sfârșit este înainte de data de început, presupunem că este în anul următor
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      dates.push({
        startDate: `${year}-${month}-${startDay}`,
        endDate: `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
      });
    }
    
    // Extragem perioade
    while ((match = periodPattern.exec(normalizedMessage)) !== null) {
      const startDay = match[1].padStart(2, '0');
      const startMonth = monthMap[match[2].toLowerCase()];
      const startYear = match[3] || new Date().getFullYear().toString();
      const endDay = match[4].padStart(2, '0');
      const endMonth = monthMap[match[5].toLowerCase()];
      const endYear = match[6] || startYear;
      
      // Verificăm dacă data de sfârșit este înainte de data de început
      const startDate = new Date(`${startYear}-${startMonth}-${startDay}`);
      const endDate = new Date(`${endYear}-${endMonth}-${endDay}`);
      
      if (endDate < startDate) {
        // Dacă data de sfârșit este înainte de data de început, presupunem că este în anul următor
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      dates.push({
        startDate: `${startYear}-${startMonth}-${startDay}`,
        endDate: `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
      });
    }
    
    // Extragem date simple
    while ((match = datePattern.exec(normalizedMessage)) !== null) {
      const day = match[1].padStart(2, '0');
      const month = monthMap[match[2].toLowerCase()];
      const year = match[3] || new Date().getFullYear().toString();
      
      // Verificăm dacă data este în trecut
      const date = new Date(`${year}-${month}-${day}`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        // Dacă data este în trecut, presupunem că este în anul următor
        date.setFullYear(date.getFullYear() + 1);
      }
      
      dates.push({
        startDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        endDate: null
      });
    }
    
    // Extragem perioade bazate pe număr de nopți
    while ((match = nightsPattern.exec(normalizedMessage)) !== null) {
      const nights = parseInt(match[1]);
      const startDay = match[2].padStart(2, '0');
      const startMonth = monthMap[match[3].toLowerCase()];
      const startYear = match[4] || new Date().getFullYear().toString();
      
      const startDate = new Date(`${startYear}-${startMonth}-${startDay}`);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + nights);
      
      dates.push({
        startDate: `${startYear}-${startMonth}-${startDay}`,
        endDate: endDate.toISOString().split('T')[0]
      });
    }
    
    // Extragem date scurte
    while ((match = shortDatePattern.exec(normalizedMessage)) !== null) {
      const day = match[1].padStart(2, '0');
      const month = monthMap[match[2].toLowerCase()];
      const year = new Date().getFullYear().toString();
      
      // Verificăm dacă data este în trecut
      const date = new Date(`${year}-${month}-${day}`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        // Dacă data este în trecut, presupunem că este în anul următor
        date.setFullYear(date.getFullYear() + 1);
      }
      
      dates.push({
        startDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        endDate: null
      });
    }
    
    // Cache rezultatul
    dateCache.set(cacheKey, {
      dates,
      timestamp: Date.now()
    });
    
    return dates;
  } catch (error) {
    console.error('❌ Error in extractDates:', error);
    return [];
  }
}

module.exports = {
  extractDates,
  monthMap
}; 