
const mongoose = require('mongoose');

const ethTransferSchema = new mongoose.Schema({
  ownerWallet: {
    type: String,

  },
  userId: {
    type: String,

  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
    },
  isSuccess: {
    type: Boolean,
    default: false
  },
  signature: {
    type: String,
    default: true
  },
}, { timestamps: true });

const Ethtransfer = mongoose.model('Ethtransfer', ethTransferSchema);

module.exports = Ethtransfer;
