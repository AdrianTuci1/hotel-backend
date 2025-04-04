const normalizeText = (text) => {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const monthMap = {
  'ian': '01', 'feb': '02', 'mar': '03', 'apr': '04',
  'mai': '05', 'iun': '06', 'iul': '07', 'aug': '08',
  'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
};

const extractDates = (message) => {
  const normalizedMessage = normalizeText(message);
  const dates = [];
  
  // Pattern pentru date în formatul "DD LLL" sau "DD LLL YYYY"
  const datePattern = /\b(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?\b/i;
  
  // Pattern pentru perioade "DD LLL - DD LLL" sau "DD LLL pana DD LLL"
  const periodPattern = /\b(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?\s*(?:-|pana|până)\s*(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?\b/i;
  
  // Pattern pentru perioade cu număr de nopți "X nopti din DD LLL"
  const nightsPattern = /\b(\d+)\s+nopti?\s+(?:din|de la)\s+(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?\b/i;

  // Extragem perioade
  let match;
  while ((match = periodPattern.exec(normalizedMessage)) !== null) {
    const startDay = match[1].padStart(2, '0');
    const startMonth = monthMap[match[2].toLowerCase()];
    const startYear = match[3] || new Date().getFullYear().toString();
    const endDay = match[4].padStart(2, '0');
    const endMonth = monthMap[match[5].toLowerCase()];
    const endYear = match[6] || new Date().getFullYear().toString();

    dates.push({
      startDate: `${startYear}-${startMonth}-${startDay}`,
      endDate: `${endYear}-${endMonth}-${endDay}`
    });
  }

  // Extragem date simple
  while ((match = datePattern.exec(normalizedMessage)) !== null) {
    const day = match[1].padStart(2, '0');
    const month = monthMap[match[2].toLowerCase()];
    const year = match[3] || new Date().getFullYear().toString();

    dates.push({
      startDate: `${year}-${month}-${day}`,
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

  return dates;
};

module.exports = {
  extractDates,
  monthMap
}; 