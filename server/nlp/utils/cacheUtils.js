/**
 * Curăță cache-ul dacă depășește limita
 * @param {Map} cache - Cache-ul de curățat
 * @param {number} maxSize - Dimensiunea maximă a cache-ului
 */
function cleanupCache(cache, maxSize) {
  if (cache.size > maxSize) {
    // Șterge 20% din intrări pentru a face loc
    const entriesToDelete = Math.floor(maxSize * 0.2);
    let count = 0;
    for (const key of cache.keys()) {
      if (count >= entriesToDelete) break;
      cache.delete(key);
      count++;
    }
  }
}

module.exports = {
  cleanupCache
}; 