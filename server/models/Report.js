const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Report = sequelize.define("Report", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM("SALES"),
    allowNull: false,
  },
  period: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
    // Structura pentru raportul de vânzări
    // {
    //   sales: {
    //     total: number,
    //     cash: number,
    //     card: number,
    //     rooms: number,
    //     pos: number
    //   },
    //   posDetails: [
    //     {
    //       name: string,
    //       totalQuantity: number,
    //       totalAmount: number
    //     }
    //   ],
    //   summary: {
    //     totalSales: number,
    //     cashSales: number,
    //     cardSales: number,
    //     roomSales: number,
    //     posSales: number,
    //     cashPercentage: string,
    //     cardPercentage: string,
    //     roomsPercentage: string,
    //     posPercentage: string
    //   }
    // }
  },
  generatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Report;