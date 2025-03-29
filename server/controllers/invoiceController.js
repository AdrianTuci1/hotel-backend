const Invoice = require("../models/Invoice");
const { addToHistory } = require('../utils/historyHelper');

// Obține toate facturile
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: "User", attributes: ["name", "email"] },
        { model: "Reservation", attributes: ["roomNumber", "checkIn", "checkOut"] }
      ]
    });

    res.json(invoices);
  } catch (error) {
    console.error("❌ Eroare la obținerea facturilor:", error);
    res.status(500).json({ message: "❌ Eroare internă la obținerea facturilor." });
  }
};

// Creează o factură nouă
const createInvoice = async (req, res) => {
  try {
    const { 
      reservationId, 
      userId, 
      amount, 
      items, 
      paymentMethod,
      status 
    } = req.body;

    // Validare date de bază
    if (!amount || !items || !paymentMethod) {
      return res.status(400).json({ 
        message: "❌ Date incomplete pentru factură.",
        required: ["amount", "items", "paymentMethod"]
      });
    }

    // Creăm factura
    const invoice = await Invoice.create({
      reservationId,
      userId,
      amount,
      items,
      paymentMethod,
      status: status || "pending"
    });

    // Adăugăm în istoric
    await addToHistory({
      type: 'INVOICE',
      action: 'CREATE',
      content: invoice,
      metadata: {
        userId: req.user.id,
        userName: req.user.name,
        invoiceId: invoice.id
      }
    });

    res.status(201).json({
      message: "✅ Factură creată cu succes.",
      invoice
    });
  } catch (error) {
    console.error("❌ Eroare la crearea facturii:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la crearea facturii." 
    });
  }
};

// Actualizează o factură existentă
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, items, paymentMethod, status } = req.body;

    // Verificăm dacă factura există
    const existingInvoice = await Invoice.findByPk(id);
    if (!existingInvoice) {
      return res.status(404).json({ 
        message: `❌ Factura cu ID-ul ${id} nu a fost găsită.` 
      });
    }

    // Salvăm datele vechi pentru istoric
    const oldData = existingInvoice.toJSON();

    // Actualizăm factura
    await existingInvoice.update({
      amount: amount || existingInvoice.amount,
      items: items || existingInvoice.items,
      paymentMethod: paymentMethod || existingInvoice.paymentMethod,
      status: status || existingInvoice.status
    });

    // Reîncărcăm factura pentru a obține datele actualizate
    const updatedInvoice = await Invoice.findByPk(id);

    // Adăugăm în istoric
    await addToHistory({
      type: 'INVOICE',
      action: 'UPDATE',
      content: {
        old: oldData,
        new: updatedInvoice.toJSON()
      },
      metadata: {
        userId: req.user.id,
        userName: req.user.name,
        invoiceId: id
      }
    });

    res.json({
      message: "✅ Factură actualizată cu succes.",
      invoice: updatedInvoice
    });
  } catch (error) {
    console.error("❌ Eroare la actualizarea facturii:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la actualizarea facturii." 
    });
  }
};

// Șterge o factură
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificăm dacă factura există
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ 
        message: `❌ Factura cu ID-ul ${id} nu a fost găsită.` 
      });
    }

    // Salvăm datele pentru istoric înainte de ștergere
    const invoiceData = invoice.toJSON();

    // Ștergem factura
    await invoice.destroy();

    // Adăugăm în istoric
    await addToHistory({
      type: 'INVOICE',
      action: 'DELETE',
      content: invoiceData,
      metadata: {
        userId: req.user.id,
        userName: req.user.name,
        invoiceId: id
      }
    });

    res.json({ 
      message: "✅ Factură ștearsă cu succes.",
      deletedId: id
    });
  } catch (error) {
    console.error("❌ Eroare la ștergerea facturii:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la ștergerea facturii." 
    });
  }
};

module.exports = {
  getAllInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
}; 