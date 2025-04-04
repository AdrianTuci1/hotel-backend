/**
 * Configurații pentru serviciul NLP
 */

// Constante pentru gestionarea memoriei
const MEMORY_CHECK_INTERVAL = 25; // Verifică memoria la fiecare 25 de mesaje
const MEMORY_THRESHOLD = 0.5; // 50% din memoria disponibilă
const MEMORY_THRESHOLD_HIGH = 0.7; // 70% din memoria disponibilă
const MEMORY_THRESHOLD_CRITICAL = 0.9; // 90% din memoria disponibilă

// Constante pentru cache
const CACHE_SIZE_LIMIT = 100; // Limita de dimensiune pentru cache
const CACHE_TTL = 30 * 1000; // 30 secunde (TTL pentru cache)

// Constante pentru procesarea mesajelor
const MAX_MESSAGE_LENGTH = 1000; // Lungimea maximă a mesajului pentru procesare

// Constante pentru pattern matching
const CONFIDENCE_THRESHOLD = 0.0009; // Prag de încredere pentru clasificare

module.exports = {
  MEMORY_CHECK_INTERVAL,
  MEMORY_THRESHOLD,
  MEMORY_THRESHOLD_HIGH,
  MEMORY_THRESHOLD_CRITICAL,
  CACHE_SIZE_LIMIT,
  CACHE_TTL,
  MAX_MESSAGE_LENGTH,
  CONFIDENCE_THRESHOLD
}; 