const mongoose = require('mongoose');


const metaDataSchema = new mongoose.Schema({
  tokenName: { type: String, required: true },
  tokenSymbol: { type: String, required: true },
  imageFileName: { type: String, required: true },
  telegramUrl: { type: String },
  twitterUrl: { type: String },
  websiteUrl: { type: String },
  description: { type: String, required: true },
  tokenAddress: { type: String, required: true },
  tokenMintKey: { type: String, required: true },
  mintAuthority: { type: String, required: true },
  bondingCurve: { type: String, required: true },
  associatedBondingCurce: { type: String, required: true },
  metadata: { type: String, required: true },
  eventAuthority: { type: String, required: true },
  slippagePctg: { type: String, required: true },
  lookupTableAddress: { type: String, required: true }
});


const MetaData = mongoose.model('MetaData', metaDataSchema);

module.exports = MetaData;
