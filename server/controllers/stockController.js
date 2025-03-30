const { Stock } = require("../models");
const { addToHistory } = require('../utils/historyHelper');

// Obține toate elementele din stoc
const getAllStock = async (req, res) => {
  try {
    const stock = await Stock.findAll({
      attributes: ["id", "name", "quantity", "unit", "minQuantity"],
      order: [["name", "ASC"]],
    });

    res.json(stock);
  } catch (error) {
    console.error("❌ Eroare la obținerea stocului:", error);
    res.status(500).json({ message: "❌ Eroare internă la obținerea stocului." });
  }
};

// Creează un element nou în stoc
const createStockItem = async (req, res) => {
  try {
    const { name, quantity, unit, minQuantity } = req.body;

    // Validare date de bază
    if (!name || !unit) {
      return res.status(400).json({ 
        message: "❌ Date incomplete pentru elementul din stoc.",
        required: ["name", "unit"]
      });
    }

    // Verificăm dacă elementul există deja
    const existingItem = await Stock.findOne({ where: { name } });
    if (existingItem) {
      return res.status(400).json({ 
        message: `❌ Elementul "${name}" există deja în stoc.` 
      });
    }

    // Creăm elementul în stoc
    const stockItem = await Stock.create({
      name,
      quantity: quantity || 0,
      unit,
      minQuantity: minQuantity || 0
    });

    // Adăugăm în istoric
    await addToHistory({
      type: 'STOCK',
      action: 'CREATE',
      content: stockItem,
      metadata: {
        userId: req.user.id,
        userName: req.user.name
      }
    });

    res.status(201).json({
      message: `✅ Elementul "${name}" a fost adăugat în stoc cu succes.`,
      stockItem
    });
  } catch (error) {
    console.error("❌ Eroare la adăugarea elementului în stoc:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la adăugarea elementului în stoc." 
    });
  }
};

// Actualizează un element din stoc
const updateStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, unit, minQuantity } = req.body;

    // Verificăm dacă elementul există
    const existingItem = await Stock.findByPk(id);
    if (!existingItem) {
      return res.status(404).json({ 
        message: `❌ Elementul cu ID-ul ${id} nu a fost găsit în stoc.` 
      });
    }

    // Salvăm datele vechi pentru istoric
    const oldData = existingItem.toJSON();

    // Actualizăm elementul
    await existingItem.update({
      name: name || existingItem.name,
      quantity: quantity !== undefined ? quantity : existingItem.quantity,
      unit: unit || existingItem.unit,
      minQuantity: minQuantity !== undefined ? minQuantity : existingItem.minQuantity
    });

    // Reîncărcăm elementul pentru a obține datele actualizate
    const updatedItem = await Stock.findByPk(id);

    // Adăugăm în istoric
    await addToHistory({
      type: 'STOCK',
      action: 'UPDATE',
      content: {
        old: oldData,
        new: updatedItem.toJSON()
      },
      metadata: {
        userId: req.user.id,
        userName: req.user.name,
        itemId: id
      }
    });

    res.json({
      message: `✅ Elementul "${updatedItem.name}" a fost actualizat cu succes.`,
      stockItem: updatedItem
    });
  } catch (error) {
    console.error("❌ Eroare la actualizarea elementului din stoc:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la actualizarea elementului din stoc." 
    });
  }
};

// Șterge un element din stoc
const deleteStockItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificăm dacă elementul există
    const stockItem = await Stock.findByPk(id);
    if (!stockItem) {
      return res.status(404).json({ 
        message: `❌ Elementul cu ID-ul ${id} nu a fost găsit în stoc.` 
      });
    }

    // Salvăm datele pentru istoric înainte de ștergere
    const itemData = stockItem.toJSON();

    // Ștergem elementul
    await stockItem.destroy();

    // Adăugăm în istoric
    await addToHistory({
      type: 'STOCK',
      action: 'DELETE',
      content: itemData,
      metadata: {
        userId: req.user.id,
        userName: req.user.name,
        itemId: id
      }
    });

    res.json({ 
      message: `✅ Elementul "${itemData.name}" a fost șters din stoc cu succes.`,
      deletedId: id
    });
  } catch (error) {
    console.error("❌ Eroare la ștergerea elementului din stoc:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la ștergerea elementului din stoc." 
    });
  }
};

module.exports = {
  getAllStock,
  createStockItem,
  updateStockItem,
  deleteStockItem
}; 