const { Schema, model } = require("mongoose");

const buySettingsSchema = new Schema(
  {
    user: {
      type: String,
      },
    userId:{
      type: String,
    },
    settingsName: {
      type: String,
      unique: true,
      required: true,
    },
    minBuy: {
      type: Number,
      required: true,
    },
    maxBuy: {
      type: Number,
      required: true,
    },
    buyPercentage: {
      type: Number,
      required: true,
    },
    isJito: {
      type: Boolean,
      required: true,
      default: false,
    },
    isPercentage: {
      type: Boolean,
      required: true,
      default: false,
    },
    isRange: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const BuySettings = model("BuySettings", buySettingsSchema);

module.exports = BuySettings;
