const natural = require("natural");
const trainingData = require("./trainingData");

const classifier = new natural.BayesClassifier();

// ✅ Antrenăm clasificatorul cu datele din `trainingData.js`
trainingData.forEach(([phrase, intent]) => classifier.addDocument(phrase, intent));
classifier.train();

module.exports = classifier;