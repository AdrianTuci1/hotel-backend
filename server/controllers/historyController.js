const { getHistory } = require('../socket/services/historyService');

/**
 * Controller pentru gestionarea istoricului mesajelor
 */

/**
 * Obține istoricul mesajelor cu paginare și filtrare
 */
const getMessageHistory = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      type,
      startDate,
      endDate
    } = req.query;

    // Convertim datele din query string în obiecte Date
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    // Validăm datele
    if (startDate && isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        error: 'Data de început invalidă'
      });
    }

    if (endDate && isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        error: 'Data de sfârșit invalidă'
      });
    }

    // Obținem istoricul
    const history = await getHistory({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      type,
      startDate: parsedStartDate,
      endDate: parsedEndDate
    });

    res.json(history);
  } catch (error) {
    console.error('❌ Eroare la obținerea istoricului:', error);
    res.status(500).json({
      error: 'A apărut o eroare la obținerea istoricului'
    });
  }
};

module.exports = {
  getMessageHistory
}; 