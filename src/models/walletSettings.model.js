const mongoose = require('mongoose');

const walletSettingsSchema = new mongoose.Schema({
  user: {
    type: String,
    },
  userId:{
    type: String,
  },
  walletAddress: { type: String, required: true },
  publicKey: { type: String, required: true },
  buySettingsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BuySettings',
    required: true,
  },
  sellSettingsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SellSettings',
    required: true,
  },
  intervalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeInterval',
    required: true,
  },
  chainId: {
    type: Number,
    required: true,
},
networkId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Li_Network",
  required: true,
},
  rpcUrls: [{ type: String }],
});

const WalletSettings = mongoose.model('WalletSettings ', walletSettingsSchema);

module.exports = WalletSettings;
