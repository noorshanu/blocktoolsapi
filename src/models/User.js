const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  walletAddress: { type: String},
  userId: { type: String },
  registeredAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
