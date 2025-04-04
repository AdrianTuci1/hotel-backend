/**
 * Utilități pentru gestionarea memoriei
 */
const { MEMORY_THRESHOLD, MEMORY_THRESHOLD_HIGH, MEMORY_THRESHOLD_CRITICAL } = require('../config/nlpConfig');

/**
 * Verifică utilizarea memoriei și returnează procentul
 * @returns {number} Procentul de utilizare a memoriei
 */
const getMemoryUsage = () => {
  const used = process.memoryUsage();
  return used.heapUsed / used.heapTotal;
};

/**
 * Verifică dacă utilizarea memoriei este peste pragul normal
 * @returns {boolean} True dacă memoria este peste prag
 */
const isMemoryUsageHigh = () => {
  return getMemoryUsage() > MEMORY_THRESHOLD;
};

/**
 * Verifică dacă utilizarea memoriei este peste pragul ridicat
 * @returns {boolean} True dacă memoria este peste pragul ridicat
 */
const isMemoryUsageVeryHigh = () => {
  return getMemoryUsage() > MEMORY_THRESHOLD_HIGH;
};

/**
 * Verifică dacă utilizarea memoriei este peste pragul critic
 * @returns {boolean} True dacă memoria este peste pragul critic
 */
const isMemoryUsageCritical = () => {
  return getMemoryUsage() > MEMORY_THRESHOLD_CRITICAL;
};

/**
 * Forțează garbage collection dacă este disponibil
 */
const forceGarbageCollection = () => {
  if (global.gc) {
    global.gc();
  }
};

/**
 * Curăță cache-ul și forțează garbage collection
 * @param {Map} cache - Cache-ul de curățat
 * @param {number} maxSize - Dimensiunea maximă a cache-ului
 * @param {number} ttl - Time-to-live pentru cache
 */
const cleanupCache = (cache, maxSize, ttl) => {
  const now = Date.now();
  
  // Șterge intrările expirate
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > ttl) {
      cache.delete(key);
    }
  }
  
  // Dacă cache-ul este încă prea mare, șterge cele mai vechi intrări
  if (cache.size > maxSize) {
    const entriesToRemove = cache.size - maxSize;
    let count = 0;
    for (const key of cache.keys()) {
      if (count >= entriesToRemove) break;
      cache.delete(key);
      count++;
    }
  }
  
  // Forțează garbage collection
  forceGarbageCollection();
};

module.exports = {
  getMemoryUsage,
  isMemoryUsageHigh,
  isMemoryUsageVeryHigh,
  isMemoryUsageCritical,
  forceGarbageCollection,
  cleanupCache
}; 