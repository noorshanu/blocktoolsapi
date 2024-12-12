const mongoose = require('mongoose');

const workerWalletSchema = new mongoose.Schema(
  {
    ownerWallet: {
      type: String,
    },

    userId: {
      type: String,
    },
    tokenAddress: {
      type: String,
    },

    walletAddress: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    isFundingWallet: {
      type: Boolean,
      default: false,
    },
    isWorkerWallet: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkerWallet', workerWalletSchema);
