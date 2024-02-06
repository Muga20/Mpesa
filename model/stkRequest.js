const { DataTypes } = require("sequelize");
const db = require('../config/config');

const StkRequest = db.define(
  'StkRequest',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    BusinessShortCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CheckoutRequestID: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MpesaReceiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ResultDesc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    TransactionDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

db.sync();

module.exports = StkRequest;
