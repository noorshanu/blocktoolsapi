
const mongoose = require('mongoose');

const timeIntervalSchema = new mongoose.Schema({
  user: {
    type: String,
    },
  userId:{
    type: String,
  },
  intervalType: {
    type: String,
    enum: ['buy', 'sell'], 
    required: true,
  },
  settingsId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: async function (value) {
        const BuySettings = mongoose.model('BuySettings');
        const SellSettings = mongoose.model('SellSettings');
        const existsInBuySettings = await BuySettings.exists({ _id: value });
        const existsInSellSettings = await SellSettings.exists({ _id: value });
        return existsInBuySettings || existsInSellSettings;
      },
      message: 'settingsID must be a valid ID from either BuySettings or SellSettings.',
    },
  },
  interval: {
    type: Number,
    required: true, 
  },
}, { timestamps: true });

const TimeInterval = mongoose.model('TimeInterval', timeIntervalSchema);

module.exports = TimeInterval;
