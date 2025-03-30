const { MessageHistory } = require('../../models');
const { Op } = require('sequelize');
const { OUTGOING_MESSAGE_TYPES } = require('../utils/messageTypes');

/**
 * Service pentru gestionarea istoricului mesajelor
 */

// Constante pentru paginare
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Constante pentru expirare
const DEFAULT_EXPIRY_DAYS = 30;

/**
 * Creează o nouă înregistrare în istoric
 * @param {Object} data - Datele mesajului
 * @param {string} data.type - Tipul mesajului
 * @param {string} data.action - Acțiunea efectuată
 * @param {Object} data.content - Conținutul mesajului
 * @param {Object} [data.metadata] - Metadate adiționale
 * @param {number} [data.expiryDays] - Numărul de zile până la expirare
 */
const createHistoryEntry = async (data) => {
  try {
    const { type, action, content, metadata, expiryDays = DEFAULT_EXPIRY_DAYS } = data;
    
    // Calculăm data de expirare
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Creăm înregistrarea
    const entry = await MessageHistory.create({
      type,
      action,
      content,
      metadata,
      expiresAt
    });

    return entry;
  } catch (error) {
    console.error('❌ Eroare la crearea înregistrării în istoric:', error);
    throw error;
  }
};

/**
 * Trimite o actualizare către toți clienții conectați
 * @param {Set} clients - Setul de clienți conectați
 * @param {Object} data - Datele mesajului
 */
const broadcastHistoryUpdate = (clients, data) => {
  const message = JSON.stringify({
    type: OUTGOING_MESSAGE_TYPES.NOTIFICATION,
    notification: {
      title: `${data.action} ${data.type}`,
      message: `A fost efectuată o acțiune de tip ${data.action} pentru ${data.type}`,
      type: 'history_update',
      data
    }
  });

  clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
};

/**
 * Obține istoricul mesajelor cu paginare
 * @param {Object} options - Opțiuni pentru paginare și filtrare
 * @param {number} [options.page=1] - Numărul paginii
 * @param {number} [options.pageSize=20] - Dimensiunea paginii
 * @param {string} [options.type] - Tipul mesajelor de filtrat
 * @param {Date} [options.startDate] - Data de început pentru filtrare
 * @param {Date} [options.endDate] - Data de sfârșit pentru filtrare
 */
const getHistory = async (options = {}) => {
  try {
    const {
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      type,
      startDate,
      endDate
    } = options;

    // Validăm dimensiunea paginii
    const validatedPageSize = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
    const offset = (page - 1) * validatedPageSize;

    // Construim condițiile de filtrare
    const where = {
      expiresAt: {
        [Op.or]: [
          { [Op.gt]: new Date() },
          { [Op.is]: null }
        ]
      }
    };

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = startDate;
      }
      if (endDate) {
        where.createdAt[Op.lte] = endDate;
      }
    }

    // Obținem totalul și înregistrările
    const { count, rows } = await MessageHistory.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: validatedPageSize,
      offset
    });

    return {
      total: count,
      page,
      pageSize: validatedPageSize,
      totalPages: Math.ceil(count / validatedPageSize),
      items: rows
    };
  } catch (error) {
    console.error('❌ Eroare la obținerea istoricului:', error);
    throw error;
  }
};

/**
 * Șterge înregistrările expirate
 */
const cleanupExpiredEntries = async () => {
  try {
    const result = await MessageHistory.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });

    console.log(`🧹 Șterse ${result} înregistrări expirate din istoric`);
    return result;
  } catch (error) {
    console.error('❌ Eroare la curățarea înregistrărilor expirate:', error);
    throw error;
  }
};

module.exports = {
  createHistoryEntry,
  broadcastHistoryUpdate,
  getHistory,
  cleanupExpiredEntries
}; 