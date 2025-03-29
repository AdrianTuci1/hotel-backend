const { Op } = require("sequelize");
const Invoice = require("../models/Invoice");
const Reservation = require("../models/Reservation");
const Stock = require("../models/Stock");
const Report = require("../models/Report");
const { addToHistory } = require('../utils/historyHelper');

// Raport complet de vânzări
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Verificăm dacă există deja un raport pentru această perioadă
    const existingReport = await Report.findOne({
      where: {
        type: "SALES",
        period: {
          startDate,
          endDate
        }
      }
    });

    if (existingReport) {
      return res.json(existingReport.data);
    }

    // Obținem toate facturile din perioada specificată
    const invoices = await Invoice.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        },
        status: "completed"
      },
      include: [
        { model: "Reservation", attributes: ["roomNumber", "checkIn", "checkOut"] }
      ]
    });

    // Calculăm vânzările pe categorii
    const sales = {
      total: 0,
      cash: 0,
      card: 0,
      rooms: 0,
      pos: 0
    };

    // Procesăm fiecare factură
    invoices.forEach(invoice => {
      const amount = invoice.amount;
      sales.total += amount;

      // Adăugăm la totalul metodei de plată
      if (invoice.paymentMethod === "cash") {
        sales.cash += amount;
      } else if (invoice.paymentMethod === "card") {
        sales.card += amount;
      }

      // Separăm vânzările pe categorii (camere vs POS)
      if (invoice.reservationId) {
        // Este o vânzare de cameră
        sales.rooms += amount;
      } else {
        // Este o vânzare POS (băuturi, servicii)
        sales.pos += amount;
      }
    });

    // Obținem detalii despre vânzările POS
    const posDetails = await Stock.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        "name",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
        [sequelize.fn("SUM", sequelize.col("price")), "totalAmount"]
      ],
      group: ["name"]
    });

    // Calculăm sumarul cu procentaje
    const summary = {
      totalSales: sales.total,
      cashSales: sales.cash,
      cardSales: sales.card,
      roomSales: sales.rooms,
      posSales: sales.pos,
      cashPercentage: ((sales.cash / sales.total) * 100).toFixed(2),
      cardPercentage: ((sales.card / sales.total) * 100).toFixed(2),
      roomsPercentage: ((sales.rooms / sales.total) * 100).toFixed(2),
      posPercentage: ((sales.pos / sales.total) * 100).toFixed(2)
    };

    // Creăm raportul
    const reportData = {
      period: { startDate, endDate },
      sales,
      posDetails,
      summary
    };

    // Salvăm raportul în baza de date
    await Report.create({
      type: "SALES",
      period: { startDate, endDate },
      data: reportData,
      generatedBy: req.user.id
    });

    // Adăugăm în istoric
    await addToHistory({
      type: 'REPORT',
      action: 'GENERATE_SALES',
      content: {
        period: { startDate, endDate },
        sales
      },
      metadata: {
        userId: req.user.id,
        userName: req.user.name
      }
    });

    res.json(reportData);
  } catch (error) {
    console.error("❌ Eroare la generarea raportului de vânzări:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la generarea raportului de vânzări." 
    });
  }
};

// Raport de ocupare camere
const getOccupancyReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const reservations = await Reservation.findAll({
      where: {
        checkIn: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        "roomNumber",
        [sequelize.fn("COUNT", sequelize.col("id")), "totalReservations"],
        [sequelize.fn("SUM", sequelize.fn("EXTRACT", sequelize.literal("EPOCH FROM (check_out - check_in)") / 86400)), "totalDays"]
      ],
      group: ["roomNumber"]
    });

    // Adăugăm în istoric
    await addToHistory({
      type: 'REPORT',
      action: 'GENERATE_OCCUPANCY',
      content: {
        period: { startDate, endDate },
        occupancy: reservations
      },
      metadata: {
        userId: req.user.id,
        userName: req.user.name
      }
    });

    res.json({
      period: { startDate, endDate },
      occupancy: reservations
    });
  } catch (error) {
    console.error("❌ Eroare la generarea raportului de ocupare:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la generarea raportului de ocupare." 
    });
  }
};

// Raport de stoc și inventar
const getInventoryReport = async (req, res) => {
  try {
    const stock = await Stock.findAll({
      attributes: [
        "name",
        "quantity",
        "unit",
        "minQuantity",
        [sequelize.literal("CASE WHEN quantity <= min_quantity THEN 'low' ELSE 'ok' END"), "status"]
      ]
    });

    // Calculăm statistici
    const stats = {
      totalItems: stock.length,
      lowStock: stock.filter(item => item.getDataValue("status") === "low").length,
      totalValue: stock.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    };

    // Adăugăm în istoric
    await addToHistory({
      type: 'REPORT',
      action: 'GENERATE_INVENTORY',
      content: {
        stats,
        items: stock.length
      },
      metadata: {
        userId: req.user.id,
        userName: req.user.name
      }
    });

    res.json({
      stats,
      items: stock
    });
  } catch (error) {
    console.error("❌ Eroare la generarea raportului de inventar:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la generarea raportului de inventar." 
    });
  }
};

// Raport de venituri pe perioade
const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, interval = "day" } = req.query;

    let timeFormat;
    switch (interval) {
      case "hour":
        timeFormat = "YYYY-MM-DD HH24";
        break;
      case "day":
        timeFormat = "YYYY-MM-DD";
        break;
      case "week":
        timeFormat = "YYYY-WW";
        break;
      case "month":
        timeFormat = "YYYY-MM";
        break;
      default:
        timeFormat = "YYYY-MM-DD";
    }

    // Obținem veniturile din rezervări
    const reservationRevenue = await Invoice.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        },
        status: "completed"
      },
      attributes: [
        [sequelize.fn("to_char", sequelize.col("created_at"), timeFormat), "period"],
        [sequelize.fn("SUM", sequelize.col("amount")), "total"]
      ],
      group: [sequelize.fn("to_char", sequelize.col("created_at"), timeFormat)],
      order: [[sequelize.fn("to_char", sequelize.col("created_at"), timeFormat), "ASC"]]
    });

    // Obținem veniturile din stoc
    const stockRevenue = await Stock.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [sequelize.fn("to_char", sequelize.col("created_at"), timeFormat), "period"],
        [sequelize.fn("SUM", sequelize.col("price")), "total"]
      ],
      group: [sequelize.fn("to_char", sequelize.col("created_at"), timeFormat)],
      order: [[sequelize.fn("to_char", sequelize.col("created_at"), timeFormat), "ASC"]]
    });

    // Combinăm datele
    const combinedRevenue = reservationRevenue.map(period => {
      const stockPeriod = stockRevenue.find(s => s.getDataValue("period") === period.getDataValue("period"));
      return {
        period: period.getDataValue("period"),
        reservationRevenue: parseFloat(period.getDataValue("total")),
        stockRevenue: stockPeriod ? parseFloat(stockPeriod.getDataValue("total")) : 0,
        total: parseFloat(period.getDataValue("total")) + (stockPeriod ? parseFloat(stockPeriod.getDataValue("total")) : 0)
      };
    });

    // Adăugăm în istoric
    await addToHistory({
      type: 'REPORT',
      action: 'GENERATE_REVENUE',
      content: {
        period: { startDate, endDate },
        interval,
        totalPeriods: combinedRevenue.length
      },
      metadata: {
        userId: req.user.id,
        userName: req.user.name
      }
    });

    res.json({
      period: { startDate, endDate },
      interval,
      revenue: combinedRevenue
    });
  } catch (error) {
    console.error("❌ Eroare la generarea raportului de venituri:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la generarea raportului de venituri." 
    });
  }
};

module.exports = {
  getSalesReport,
  getOccupancyReport,
  getInventoryReport,
  getRevenueReport
}; 