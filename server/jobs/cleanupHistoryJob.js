const cron = require('node-cron');
const { cleanupExpiredEntries } = require('../socket/services/historyService');

/**
 * Job pentru curățarea automată a înregistrărilor expirate din istoric
 */

// Rulează zilnic la ora 00:00
const schedule = '0 0 * * *';

const cleanupHistoryJob = cron.schedule(schedule, async () => {
  try {
    console.log('🔄 Pornire job curățare istoric...');
    await cleanupExpiredEntries();
    console.log('✅ Job curățare istoric finalizat cu succes');
  } catch (error) {
    console.error('❌ Eroare la executarea job-ului de curățare istoric:', error);
  }
});

module.exports = cleanupHistoryJob; 