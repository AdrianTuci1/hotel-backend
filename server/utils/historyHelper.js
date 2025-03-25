const { createHistoryEntry, broadcastHistoryUpdate } = require('../socket/services/historyService');
const { getClients } = require('../socket/actions/connectionHandler');

/**
 * Helper pentru adăugarea înregistrărilor în istoric și broadcast către clienți
 * @param {Object} data - Datele pentru istoric
 * @param {string} data.type - Tipul mesajului (ex: RESERVATION, ROOM, POS)
 * @param {string} data.action - Acțiunea efectuată (ex: CREATE, UPDATE, DELETE)
 * @param {Object} data.content - Conținutul mesajului
 * @param {Object} data.metadata - Metadate adiționale (ex: user, timestamp)
 * @param {number} [data.expiryDays] - Numărul de zile până la expirare
 */
const addToHistory = async (data) => {
  try {
    // Adăugăm timestamp și alte metadate dacă nu există
    const metadata = {
      timestamp: new Date(),
      ...data.metadata
    };

    // Creăm înregistrarea în istoric
    await createHistoryEntry({
      ...data,
      metadata
    });

    // Trimitem actualizare către clienți
    broadcastHistoryUpdate(getClients(), {
      ...data,
      metadata
    });
  } catch (error) {
    console.error('❌ Eroare la adăugarea în istoric:', error);
    // Nu aruncăm eroarea pentru a nu întrerupe fluxul principal
  }
};

module.exports = {
  addToHistory
}; 