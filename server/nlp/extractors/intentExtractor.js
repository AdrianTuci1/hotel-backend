const normalizeText = (text) => {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Definim pattern-urile pentru fiecare comandă
const commandPatterns = {
  // Rezervări
  rezervare: {
    pattern: /\b(rezervare|rezerva|rezerv)\b\s+([^]+?)\s+(single|dubla|twin|apartament|deluxe|superioara|standard)\s+(\d{1,2}\s+(?:ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)(?:\s+-\s+\d{1,2}\s+(?:ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec))?)/i,
    groups: {
      name: 2,
      roomType: 3,
      dates: 4
    }
  },
  
  // Adăugare cameră
  "adauga camera": {
    pattern: /\b(adauga|adaugă|creeaza|creează)\s+camera?\s+([a-zA-Z0-9]+)\s+(single|dubla|twin|apartament|deluxe|superioara|standard)\s+(\d+)\s*(?:lei|ron|€|euro)?/i,
    groups: {
      roomNumber: 2,
      roomType: 3,
      price: 4
    }
  },
  
  // Adăugare telefon
  tel: {
    pattern: /\b(tel|telefon)\s+([a-zA-Z0-9]+)\s+(\d{1,2}\s+(?:ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec))\s+((?:\+?4?0|0)?[ \-\.]?(?:7[0-9]{2}|7[0-9]{8}|[0-9]{2}[ \-\.]?[0-9]{3}[ \-\.]?[0-9]{3}|[0-9]{3}[ \-\.]?[0-9]{3}[ \-\.]?[0-9]{3}))/i,
    groups: {
      roomNumber: 2,
      date: 3,
      phoneNumber: 4
    }
  },

  // Vânzare produse
  vanzare: {
    pattern: /\b(vanzare|vânzare|vinde|vând)\s+([^]+?)\s+camera?\s+(\d+)/i,
    groups: {
      products: 2,
      roomNumber: 3
    }
  },

  // Probleme cameră
  problema: {
    pattern: /\b(problema|probl|issue|defect)\s+([a-zA-Z0-9]+)\s+([^]+)/i,
    groups: {
      roomNumber: 2,
      description: 3
    }
  }
};

const extractIntent = (message) => {
  const normalizedMessage = normalizeText(message);
  
  // Verificăm fiecare pattern de comandă
  for (const [command, { pattern, groups }] of Object.entries(commandPatterns)) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      // Construim obiectul cu entitățile extrase
      const entities = {};
      for (const [key, groupIndex] of Object.entries(groups)) {
        entities[key] = match[groupIndex].trim();
      }
      
      return {
        intent: command,
        entities
      };
    }
  }
  
  return null;
};

module.exports = {
  extractIntent,
  commandPatterns
}; 