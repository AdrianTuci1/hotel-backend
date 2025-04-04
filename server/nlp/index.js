/**
 * Modul principal NLP
 */
const { analyzeMessage, cleanup } = require('./core/nlpService');
const { getClassifier } = require('./core/classifier');
const trainingData = require('./config/trainingData');

// Inițializăm classifier-ul cu datele de antrenament
const initializeClassifier = () => {
  const classifier = getClassifier();
  
  // Adăugăm datele de antrenament
  trainingData.forEach(item => {
    classifier.addDocument(item.text, item.intent);
  });
  
  // Antrenăm classifier-ul
  classifier.train();
  
  console.log('✅ NLP classifier initialized and trained');
};

// Inițializăm classifier-ul la pornire
initializeClassifier();

module.exports = {
  analyzeMessage,
  cleanup
}; 