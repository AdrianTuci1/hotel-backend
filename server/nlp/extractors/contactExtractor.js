/**
 * Modul pentru extragerea informațiilor de contact
 */
const { cleanupCache } = require('../utils/memoryUtils');
const { CACHE_SIZE_LIMIT, CACHE_TTL } = require('../config/nlpConfig');

// Cache pentru rezultate
const contactCache = new Map();

// Lista de cuvinte care nu pot fi nume
const nonNameWords = new Set([
    'rezervare', 'camera', 'pentru', 'vreau', 'doresc', 'hotel',
    'single', 'dubla', 'twin', 'apartament', 'deluxe', 'superioara', 'standard',
    'fumator', 'nefumator', 'vedere', 'mare', 'etaj', 'superior', 'parcare',
    'inclusa', 'inclus', 'pat', 'suplimentar', 'mic', 'dejun',
    'zile', 'nopti', 'pana', 'intre', 'perioada', 'data', 'mar', 'apr', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec', 
    'ianuarie', 'februarie', 'martie', 'aprilie', 'mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie',
    'problema', 'probl', 'issue', 'defect', 'telefon', 'numar', 'număr', 'nr', 'tel'
]);

/**
 * Extrage numele dintr-un mesaj
 * @param {string} message - Mesajul din care se extrage numele
 * @param {string} [context] - Context opțional (ex: tip camera)
 * @returns {string|null} Numele extras sau null dacă nu s-a găsit
 */
function extractName(message, context) {
    try {
        // Verifică cache-ul
        const cacheKey = `${message}:${context || ''}`;
        const cached = contactCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.name;
        }

        // Curăță cache-ul dacă este necesar
        if (contactCache.size >= CACHE_SIZE_LIMIT) {
            cleanupCache(contactCache, CACHE_SIZE_LIMIT, CACHE_TTL);
        }

        // Pattern-uri pentru extragerea numelui
        const patterns = [
            // Pattern pentru "nume: X" sau "client: X" (pentru compatibilitate)
            /(?:nume|client)\s*:\s*([A-Za-zĂăÂâÎîȘșȚț\s]+)/i,
            
            // Pattern pentru "domnul/doamna X"
            /(?:domnul|doamna)\s+([A-Za-zĂăÂâÎîȘșȚț\s]+)/i,
            
            // Pattern pentru "X a rezervat" sau "X dorește"
            /([A-Za-zĂăÂâÎîȘșȚț\s]+)\s+(?:a rezervat|dorește|vrea)/i,
            
            // Pattern pentru nume după context (ex: "pentru X")
            context ? new RegExp(`(?:pentru|la|clientul)\\s+([A-Za-zĂăÂâÎîȘșȚț\\s]+)(?=\\s+${context})`, 'i') : null
        ].filter(Boolean);

        // Încearcă mai întâi pattern-urile specifice
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                const name = match[1].trim();
                // Verifică dacă numele are cel puțin 2 caractere
                if (name.length >= 2) {
                    // Cache rezultatul
                    contactCache.set(cacheKey, {
                        name,
                        timestamp: Date.now()
                    });
                    return name;
                }
            }
        }

        // Dacă nu am găsit cu pattern-uri specifice, încercăm extragerea automată
        const words = message.split(/\s+/);
        let potentialName = null;
        
        // Căutăm secvențe de cuvinte care ar putea fi nume
        for (let i = 0; i < words.length; i++) {
            // Verificăm secvențe de 2-3 cuvinte
            for (let len = 2; len <= 3 && i + len <= words.length; len++) {
                const candidate = words.slice(i, i + len).join(' ');
                
                // Verificăm dacă candidatul ar putea fi un nume
                if (isPotentialName(candidate)) {
                    potentialName = candidate;
                    break;
                }
            }
            if (potentialName) break;
        }
        
        if (potentialName) {
            // Cache rezultatul
            contactCache.set(cacheKey, {
                name: potentialName,
                timestamp: Date.now()
            });
            return potentialName;
        }

        return null;
    } catch (error) {
        console.error('❌ Error in extractName:', error);
        return null;
    }
}

/**
 * Verifică dacă un string ar putea fi un nume
 * @param {string} candidate - String-ul de verificat
 * @returns {boolean} True dacă ar putea fi un nume
 */
function isPotentialName(candidate) {
    // Verifică dacă are lungimea corectă
    if (candidate.length < 4 || candidate.length > 30) return false;
    
    // Verifică dacă conține doar litere și spații
    if (!/^[A-Za-zĂăÂâÎîȘșȚț\s]+$/.test(candidate)) return false;
    
    // Verifică dacă nu este în lista de cuvinte care nu pot fi nume
    const words = candidate.toLowerCase().split(/\s+/);
    for (const word of words) {
        if (nonNameWords.has(word)) return false;
    }
    
    // Verifică dacă are cel puțin două cuvinte sau un cuvânt lung
    if (words.length === 1 && words[0].length < 4) return false;
    
    return true;
}

/**
 * Extrage numărul de telefon dintr-un mesaj
 * @param {string} message - Mesajul din care se extrage numărul
 * @returns {string|null} Numărul de telefon extras sau null dacă nu s-a găsit
 */
function extractPhoneNumber(message) {
    try {
        // Verifică cache-ul
        const cacheKey = message;
        const cached = contactCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.phone;
        }

        // Curăță cache-ul dacă este necesar
        if (contactCache.size >= CACHE_SIZE_LIMIT) {
            cleanupCache(contactCache, CACHE_SIZE_LIMIT, CACHE_TTL);
        }

        // Pattern-uri pentru extragerea numărului de telefon
        const patterns = [
            // Pattern pentru numere cu prefix +40 sau 0
            /(?:(?:\+40|0)\s*)?(\d{3}\s*\d{3}\s*\d{3})/,
            
            // Pattern pentru numere cu prefix 07
            /(?:07|7)\s*(\d{2}\s*\d{3}\s*\d{3})/,
            
            // Pattern pentru numere cu prefix 02 sau 03
            /(?:02|03)\s*(\d{2}\s*\d{3}\s*\d{3})/,
            
            // Pattern pentru numere cu prefix 037
            /037\s*(\d{2}\s*\d{3}\s*\d{3})/,
            
            // Pattern pentru numere cu prefix 074, 075, 076, 077
            /(?:074|075|076|077)\s*(\d{3}\s*\d{3})/,
            
            // Pattern pentru numere cu prefix 072, 073
            /(?:072|073)\s*(\d{3}\s*\d{3})/
        ];

        // Încearcă fiecare pattern
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                // Curăță numărul de spații
                const phone = match[1].replace(/\s+/g, '');
                
                // Verifică dacă numărul are lungimea corectă (9 cifre)
                if (phone.length === 9) {
                    // Normalizează numărul (adaugă prefix 0 dacă nu există)
                    const normalizedPhone = phone.startsWith('0') ? phone : `0${phone}`;
                    
                    // Cache rezultatul
                    contactCache.set(cacheKey, {
                        phone: normalizedPhone,
                        timestamp: Date.now()
                    });
                    return normalizedPhone;
                }
            }
        }

        return null;
    } catch (error) {
        console.error('❌ Error in extractPhoneNumber:', error);
        return null;
    }
}

/**
 * Extrage toate informațiile de contact dintr-un mesaj
 * @param {string} message - Mesajul din care se extrag informațiile
 * @param {string} [context] - Context opțional (ex: tip camera)
 * @returns {Object} Obiect cu informațiile de contact extrase
 */
function extractContact(message, context) {
    try {
        // Verifică cache-ul
        const cacheKey = `${message}:${context || ''}`;
        const cached = contactCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.contact;
        }

        // Curăță cache-ul dacă este necesar
        if (contactCache.size >= CACHE_SIZE_LIMIT) {
            cleanupCache(contactCache, CACHE_SIZE_LIMIT, CACHE_TTL);
        }

        const name = extractName(message, context);
        const phoneNumber = extractPhoneNumber(message);

        const contact = {
            name: name || null,
            phoneNumber: phoneNumber || null
        };

        // Cache rezultatul
        contactCache.set(cacheKey, {
            contact,
            timestamp: Date.now()
        });

        return contact;
    } catch (error) {
        console.error('❌ Error in extractContact:', error);
        return {
            name: null,
            phoneNumber: null
        };
    }
}

module.exports = {
    extractName,
    extractPhoneNumber,
    extractContact
}; 