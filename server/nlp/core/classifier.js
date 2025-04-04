/**
 * Modul pentru clasificarea mesajelor
 */
const natural = require('natural');
const { CONFIDENCE_THRESHOLD } = require('../config/nlpConfig');
const { forceGarbageCollection } = require('../utils/memoryUtils');

// Inițializăm classifier-ul
let classifier = null;

/**
 * Inițializează classifier-ul
 */
const initializeClassifier = () => {
  if (!classifier) {
    classifier = new natural.BayesClassifier();
  }
  return classifier;
};

/**
 * Obține classifier-ul
 * @returns {natural.BayesClassifier} Classifier-ul
 */
const getClassifier = () => {
  if (!classifier) {
    return initializeClassifier();
  }
  return classifier;
};

/**
 * Curăță resursele classifier-ului
 */
const cleanup = () => {
  if (classifier) {
    // Eliberăm memoria
    classifier = null;
    forceGarbageCollection();
  }
};

module.exports = {
  getClassifier,
  cleanup,
  CONFIDENCE_THRESHOLD
}; 