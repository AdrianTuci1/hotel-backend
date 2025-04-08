const { MessageHistory } = require('../../models');
const { OUTGOING_MESSAGE_TYPES, NOTIFICATION_TYPES } = require('../utils/messageTypes');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); // For history item IDs
const WebSocket = require('ws');

/**
 * Service pentru gestionarea istoricului mesajelor și evenimentelor
 */

// 🔥 Formatează o intrare din DB în formatul standard pentru HISTORY item
const formatHistoryEntryForResponse = (dbEntry) => {
  // Adapt this based on how different entry types are stored in MessageHistory model
  let entryType = 'event'; // Default to generic event
  let payload = {};

  // Example: Determine entryType and payload based on dbEntry fields
  if (dbEntry.type === 'whatsapp_message' || dbEntry.type === 'booking_email' || dbEntry.type === 'price_analysis') {
    entryType = 'notification';
    payload = {
      title: dbEntry.metadata?.title || 'Notification', // Extract from metadata or use default
      message: dbEntry.content?.message || 'Details in content', // Extract from content
      type: dbEntry.type, // The original DB type becomes the notification sub-type
      data: dbEntry.content // Put original content as data
    };
  } else if (dbEntry.type === 'chat_message') { // Assuming chat messages are stored with this type
      entryType = 'message';
      payload = {
          intent: dbEntry.metadata?.intent || null, // Extract intent if stored
          message: dbEntry.content?.message || '' // Extract message text
      };
  } else {
      // Generic event mapping
      entryType = 'event';
      payload = {
        eventType: dbEntry.type, // Original DB type
        action: dbEntry.action,
        content: dbEntry.content,
        metadata: dbEntry.metadata
      };
  }

  return {
    id: dbEntry.id, // Use DB id
    entryType: entryType,
    timestamp: dbEntry.createdAt.toISOString(), // Use DB timestamp
    payload: payload
  };
};


// 🔥 Creează o nouă intrare în istoric
const createHistoryEntry = async (data) => {
  try {
    // Validate or transform data before saving if needed
    const entry = await MessageHistory.create({
      id: data.id || uuidv4(), // Allow providing ID or generate one
      type: data.type, // e.g., 'whatsapp_message', 'chat_message', 'user_action'
      action: data.action, // e.g., 'received', 'sent', 'created', 'failed'
      content: data.content, // JSON object with main details
      metadata: data.metadata, // JSON object with extra info
      expiresAt: data.expiresAt // Optional expiry date
    });
    console.log("💾 Intrare istoric creată:", entry.id);
    return entry;
  } catch (error) {
    console.error("❌ Eroare la crearea intrării în istoric:", error);
    throw error;
  }
};

// 🔥 Trimite un update de istoric către toți clienții (folosind formatul HISTORY)
const broadcastHistoryUpdate = (clients, updatedEntry) => {
  try {
    const formattedEntry = formatHistoryEntryForResponse(updatedEntry); // Format the entry
    const message = JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.HISTORY,
      data: {
        items: [formattedEntry] // Send the single updated/new item
      }
    });

    console.log(`📢 Difuzare update istoric (ID: ${formattedEntry.id}) către ${clients.size} clienți.`);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } catch (error) {
    console.error("❌ Eroare la difuzarea update-ului de istoric:", error);
  }
};

// 🔥 Obține istoricul mesajelor cu paginare
const getHistory = async (options = {}) => {
  const { page = 1, pageSize = 50, filter = {} } = options;
  const limit = parseInt(pageSize, 10);
  const offset = (parseInt(page, 10) - 1) * limit;

  // Build filter conditions (example)
  const whereClause = {};
  if (filter.type) {
    whereClause.type = filter.type;
  }
  // Add other filters as needed

  try {
    const { count, rows } = await MessageHistory.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset,
      raw: false // Get Sequelize model instances to use formatHistoryEntryForResponse
    });

    const formattedItems = rows.map(formatHistoryEntryForResponse);

    return {
      total: count,
      page: parseInt(page, 10),
      pageSize: limit,
      totalPages: Math.ceil(count / limit),
      items: formattedItems // Use the formatted items
    };
  } catch (error) {
    console.error("❌ Eroare la obținerea istoricului:", error);
    throw error;
  }
};

// 🔥 Șterge intrările din istoric mai vechi decât o anumită dată
const deleteOldHistoryEntries = async (cutoffDate) => {
  try {
    const result = await MessageHistory.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        }
      }
    });
    console.log(`🧹 Au fost șterse ${result} intrări vechi din istoric.`);
    return result;
  } catch (error) {
    console.error("❌ Eroare la ștergerea intrărilor vechi din istoric:", error);
    throw error;
  }
};

module.exports = {
  createHistoryEntry,
  broadcastHistoryUpdate,
  getHistory,
  deleteOldHistoryEntries
}; 