const { Schema, model } = require("mongoose");

const sellSettingsSchema = new Schema(
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
    minSell: {
      type: Number,
      required: true,
    },
    maxSell: {
      type: Number,
      required: true,
    },
    sellPercentage: {
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

const SellSettings = model("SellSettings", sellSettingsSchema);

module.exports = SellSettings;
