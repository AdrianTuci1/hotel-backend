/**
 * Serviciul principal NLP
 */
const { detectIntent, fallbackProcessing, getExtraIntents } = require('./patternMatcher');
const { extractEntities } = require('../extractors');
const { intentMessages } = require('../config/intentMessages');
const { CHAT_INTENTS } = require('../../socket/utils/messageTypes');
const { getMemoryUsage, isMemoryUsageCritical, forceGarbageCollection, cleanupCache } = require('../utils/memoryUtils');
const { normalizeText } = require('../utils/textUtils');

// Cache pentru rezultate
const resultCache = new Map();
const CACHE_SIZE_LIMIT = 1000;

// Verifică și curăță cache-ul dacă este necesar
function checkAndCleanCache() {
    if (resultCache.size > CACHE_SIZE_LIMIT) {
        cleanupCache(resultCache, CACHE_SIZE_LIMIT, 1000 * 60 * 60); // 1 oră TTL
    }
}

/**
 * Analizează un mesaj și extrage intenția și entitățile
 * @param {string} message - Mesajul de analizat
 * @returns {Promise<Object>} Rezultatul analizei
 */
async function analyzeMessage(message) {
    try {
        // Verifică memoria
        const memoryUsage = getMemoryUsage();
        console.log(`📊 Utilizare memorie: ${(memoryUsage * 100).toFixed(2)}%`);
        
        // Normalizează textul
        const normalizedMessage = normalizeText(message);
        console.log("🔍 Mesaj normalizat:", normalizedMessage);
        
        // Verifică cache-ul
        const cacheKey = normalizedMessage;
        if (resultCache.has(cacheKey)) {
            return resultCache.get(cacheKey);
        }
        
        // Verifică dacă memoria este critică
        if (isMemoryUsageCritical()) {
            console.warn('Memorie critică în NLP Service, folosim procesare simplificată');
            forceGarbageCollection();
            
            // Folosim procesarea simplificată
            const fallbackResult = fallbackProcessing(normalizedMessage);
            
            // Adăugăm extraIntents
            fallbackResult.extraIntents = getExtraIntents(fallbackResult.intent);
            
            // Cache rezultatul
            resultCache.set(cacheKey, fallbackResult);
            
            return fallbackResult;
        }
        
        // Detectează intenția
        const intentResult = detectIntent(normalizedMessage);
        console.log("🎯 Intenție detectată:", intentResult);
        
        // Extrage entitățile folosind extractorul
        const entities = await extractEntities(normalizedMessage, intentResult);
        console.log("📦 Entități extrase:", entities);
        
        // Calculează confidența
        const confidence = intentResult === CHAT_INTENTS.UNKNOWN ? 0 : 1;
        
        // Obține intențiile suplimentare
        const extraIntents = getExtraIntents(intentResult);
        
        // Creează rezultatul
        const result = {
            intent: intentResult,
            entities,
            extraIntents,
            confidence,
            message: intentMessages[intentResult] || "✅ Comandă procesată!"
        };
        
        // Verifică și curăță cache-ul
        checkAndCleanCache();
        
        // Salvează în cache
        resultCache.set(cacheKey, result);
        
        return result;
    } catch (error) {
        console.error('❌ Error in analyzeMessage:', error);
        return {
            intent: CHAT_INTENTS.UNKNOWN,
            entities: {},
            extraIntents: [],
            confidence: 0,
            message: "❌ A apărut o eroare la procesarea comenzii."
        };
    }
}

// Curăță resursele
function cleanup() {
    try {
        // Curăță cache-ul
        resultCache.clear();
        
        // Forțează garbage collection
        forceGarbageCollection();
    } catch (error) {
        console.error('❌ Error in cleanup:', error);
    }
}

module.exports = {
    analyzeMessage,
    cleanup
}; 