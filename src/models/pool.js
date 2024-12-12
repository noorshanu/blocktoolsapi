const mongoose = require('mongoose');

const PoolSchema = new mongoose.Schema({
    tokenaddress1: { type: String, required: true },
    privatekey: { type: String, required: true },
    tokenAddress2: { type: String, required: true },  
    tokenAmount1: { type: String, required: true },  
    tokenAmount2: { type: String, required: true },  
    routerAddress: { type: String, required: true },  
    version: { type: String, required: true },  
    rpurl: { type: String, required: true },  
  createdAt: { type: Date, default: Date.now },
});

const Pool = mongoose.model('Pool', PoolSchema);

module.exports = Pool;
