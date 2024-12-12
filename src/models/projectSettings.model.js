// models/ProjectSettings.js
const mongoose = require('mongoose');

const projectSettingsSchema = new mongoose.Schema({
  user: {
    type: String,
    },
  userId:{
    type: String,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Li_Project',
    required: true
  },
  walletList: [
    {
      type: mongoose.Schema.Types.ObjectId,  
      ref: 'WalletSettings', 
      required: true
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  isLive: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('ProjectSettings', projectSettingsSchema);
