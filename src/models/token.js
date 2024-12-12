const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  userId: { type: String },  
  ownerWallet: { type: String },  
  tokenAddress: { type: String },  
  name: { type: String, required: true },  
  symbol: { type: String, required: true },  
  decimals: { type: Number, required: true },  
  totalSupply: { type: String, required: true },  
  rpcUrl: { type: String, required: true }, 
  publicKey: { type: String, required: false }, 
  privateKey: { type: String, required: false }, 
  deployer: { type: String, required: true },  
  deployValue: { type: String, required: true },  
  createdAt: { type: Date, default: Date.now },  
  success: { type: Boolean, default: false },  
  deploymentHash: { type: String, required: false }  
});

const Token = mongoose.model('Token', TokenSchema);

module.exports = Token;
