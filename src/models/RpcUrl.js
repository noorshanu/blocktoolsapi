const mongoose = require('mongoose');

const RpcUrlSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  rpcUrl: { type: String, required: true },
  name: { type: String, required: true },  // Name for the RPC URL (for identification)
  createdAt: { type: Date, default: Date.now },
});

const RpcUrl = mongoose.model('RpcUrl', RpcUrlSchema);

module.exports = RpcUrl;
