
const { sendErrorResponse } = require("../helpers");
const BuySettings = require("../models/buySettings.model");
const User = require("../models/User");


module.exports = {
  createSettings: async (req, res) => {
    try {
      const {
        settingsName,
        minBuy,
        maxBuy,
        buyPercentage,
        isJito,
        isPercentage,
        isRange,
        walletAddress,
        userId
      } = req.body;
  
      if (!userId && !walletAddress) {
        return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
      }
  
      if (userId) {
        const user = await User.findOne({ userId });
        if (!user) {
          return res.status(400).json({ error: 'User not registered' });
        }
      }
  
      if (!settingsName) {
        return sendErrorResponse(res, 400, 'Settings name is required');
      }
      const query = userId ?  {user: userId}  : {walletAddress} ;
      const existingSetting = await BuySettings.findOne({
        ...query,
        settingsName
      });
  
      if (existingSetting) {
        return sendErrorResponse(res, 400, 'Settings name already exists');
      }
  
      if (minBuy === undefined || minBuy === null) {
        return sendErrorResponse(res, 400, 'Min buy is required');
      }
  
      if (maxBuy === undefined || maxBuy === null) {
        return sendErrorResponse(res, 400, 'Max buy is required');
      }
  
      if (buyPercentage === undefined || buyPercentage === null) {
        return sendErrorResponse(res, 400, 'Buy percentage is required');
      }
  
      const parsedMinBuy = parseInt(minBuy, 10);
      const parsedMaxBuy = parseInt(maxBuy, 10);
      const parsedBuyPercentage = parseInt(buyPercentage, 10);
  
      if (
        isNaN(parsedMinBuy) ||
        isNaN(parsedMaxBuy) ||
        isNaN(parsedBuyPercentage)
      ) {
        return sendErrorResponse(
          res,
          400,
          'minBuy, maxBuy, and buyPercentage must be valid numbers'
        );
      }
  
      const newBuySettingsData = {
        settingsName,
        minBuy: parsedMinBuy,
        maxBuy: parsedMaxBuy,
        buyPercentage: parsedBuyPercentage,
        isJito,
        isPercentage,
        isRange,
      };
  
      if (userId) {
        newBuySettingsData.user = userId;
      } else {
        newBuySettingsData.walletAddress = walletAddress;
      }
  
      const newBuySettings = new BuySettings(newBuySettingsData);
      await newBuySettings.save();
  
      res.status(200).json(newBuySettings);
  
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  },
  
  getAllSettings: async (req, res) => {
    try {
      const { userId, walletAddress } = req.body;
  
      if (!userId && !walletAddress) {
        return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
      }
  
      const query = userId ? { user: userId } : { walletAddress };
      const settings = await BuySettings.find(query).select(
        'settingsName minBuy maxBuy buyPercentage isJito isPercentage isRange'
      );
  
      res.status(200).json(settings);
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  },
  
  editSettings: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, walletAddress } = req.body;
  
      if (!userId && !walletAddress) {
        return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
      }
  
      const user = userId ? await User.findOne({ userId }) : await User.findOne({ walletAddress });
      if (!user) {
        return res.status(400).json({ error: 'Wallet not registered' });
      }
  
      const currentSetting = await BuySettings.findById(id);
      if (!currentSetting) {
        return sendErrorResponse(res, 404, 'Settings not found');
      }
  
      const updatedFields = {};
  
      if (req.body.settingsName) {
        const query = userId ?  {user: userId}  : {walletAddress} ;
        const existingSetting = await BuySettings.findOne({
          ...query,
          settingsName
        });
        if (existingSetting) {
          return sendErrorResponse(res, 400, 'Settings name already exists');
        }
        updatedFields.settingsName = req.body.settingsName;
      }
  
      if (req.body.minBuy !== undefined) {
        updatedFields.minBuy = parseInt(req.body.minBuy, 10);
        if (isNaN(updatedFields.minBuy)) {
          return sendErrorResponse(res, 400, 'Invalid minBuy value');
        }
      }
  
      if (req.body.maxBuy !== undefined) {
        updatedFields.maxBuy = parseInt(req.body.maxBuy, 10);
        if (isNaN(updatedFields.maxBuy)) {
          return sendErrorResponse(res, 400, 'Invalid maxBuy value');
        }
      }
  
      if (req.body.buyPercentage !== undefined) {
        updatedFields.buyPercentage = parseInt(req.body.buyPercentage, 10);
        if (isNaN(updatedFields.buyPercentage)) {
          return sendErrorResponse(res, 400, 'Invalid buyPercentage value');
        }
      }
  
      if (req.body.isJito !== undefined) updatedFields.isJito = req.body.isJito;
      if (req.body.isPercentage !== undefined) updatedFields.isPercentage = req.body.isPercentage;
      if (req.body.isRange !== undefined) updatedFields.isRange = req.body.isRange;
  
      const updatedSetting = await BuySettings.findByIdAndUpdate(id, { $set: updatedFields }, { new: true });
      if (!updatedSetting) {
        return sendErrorResponse(res, 404, 'Settings not found');
      }
  
      res.status(200).json({ message: 'Settings updated successfully' });
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  },
  
  deleteSettings: async (req, res) => {
    try {
      const { settingsName, userId, walletAddress } = req.body;
  
      if (!userId && !walletAddress) {
        return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
      }
  
      const user = userId ? await User.findOne({ userId }) : await User.findOne({ walletAddress });
      if (!user) {
        return res.status(400).json({ error: 'Wallet not registered' });
      }
  
      if (!settingsName) {
        return sendErrorResponse(res, 400, 'Settings name is required');
      }
  
      const query = userId ? { user: userId, settingsName } : { walletAddress, settingsName };
      const deletedSetting = await BuySettings.findOneAndDelete(query);
  
      if (!deletedSetting) {
        return sendErrorResponse(res, 404, 'Settings not found');
      }
  
      res.status(200).json({ message: 'Settings deleted successfully' });
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  }
  
};
