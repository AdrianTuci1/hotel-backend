const { Sequelize } = require("sequelize");

// 📌 Inițializăm Sequelize folosind `DATABASE_URL` din `.env`
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

const syncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectat la baza de date!");

    // ❗ Eliminăm `alter: true` pentru a preveni modificarea tabelelor la fiecare restart
    await sequelize.sync();
    console.log("✅ Modelele sunt sincronizate!");
  } catch (error) {
    console.error("❌ Eroare la conectarea bazei de date:", error);
  }
};

module.exports = { sequelize, syncDB };