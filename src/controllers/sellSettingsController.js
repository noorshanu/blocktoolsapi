

const { sendErrorResponse } = require("../helpers");
const SellSettings = require("../models/sellSettings.model");
const User = require("../models/User");

module.exports = {
  createSellSettings: async (req, res) => {
    try {
      const {
        settingsName,
        minSell,
        maxSell,
        sellPercentage,
        isJito,
        isPercentage,
        isRange,
        walletAddress,
        userId
      } = req.body;
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(400).json({ error: 'Wallet not registered' });
      }
      if (!settingsName) {
        return sendErrorResponse(res, 400, 'Settings name is required');
      }

      const existingSetting = await SellSettings.findOne({user:userId},{ settingsName });
      if (existingSetting) {
        return sendErrorResponse(res, 400, "Settings name already exists");
      }

      if (minSell === undefined || minSell === null) {
        return sendErrorResponse(res, 400, 'Min sell is required');
      }
      if (maxSell === undefined || maxSell === null) {
        return sendErrorResponse(res, 400, 'Max sell is required');
      }
      if (sellPercentage === undefined || sellPercentage === null) {
        return sendErrorResponse(res, 400, 'Sell percentage is required');
      }

      const parsedMinSell = parseInt(minSell, 10);
      const parsedMaxSell = parseInt(maxSell, 10);
      const parsedSellPercentage = parseInt(sellPercentage, 10);

      if (
        isNaN(parsedMinSell) ||
        isNaN(parsedMaxSell) ||
        isNaN(parsedSellPercentage)
      ) {
        return sendErrorResponse(
          res,
          400,
          'minSell, maxSell, and sellPercentage must be valid numbers'
        );
      }

      const newSellSettings = new SellSettings({
        user: userId,
        settingsName,
        minSell: parsedMinSell,
        maxSell: parsedMaxSell,
        sellPercentage: parsedSellPercentage,
        isJito,
        isPercentage,
        isRange,
      });

      await newSellSettings.save();
      res.status(200).json(newSellSettings);
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  },
  getAllSellSettings: async (req, res) => {
    try {
      const {userId} = req.body;
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(400).json({ error: 'User not registered' });
      }
      const settings = await SellSettings.find({user:userId}).select('SettingsName minSell maxSell sellPercentage isJito isPercentage isRange');;
      res.status(200).json(settings);
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  },
  editSellSettings: async (req, res) => {
    try {
        const { id } = req.params;
        const {userId} = req.body
        const user = await User.findOne({ userId });
        if (!user) {
          return res.status(400).json({ error: 'User not registered' });
        }

        const currentSetting = await SellSettings.findById( id );
    
        if (!currentSetting) {
          return sendErrorResponse(res, 404, 'Settings not found');
        }
    
        
        const updatedFields = {};
    
        if (req.body.settingsName) {
            const existingSetting = await SellSettings.findOne({user:userId},{ settingsName: req.body.settingsName });
          if (existingSetting) {
            return sendErrorResponse(res, 400, "Settings name already exists");
          }
          updatedFields.settingsName = req.body.settingsName;
        }

      if (req.body.minSell !== undefined) {
        updatedFields.minSell = parseInt(req.body.minSell, 10);
        if (isNaN(updatedFields.minSell)) {
          return sendErrorResponse(res, 400, 'Invalid minSell value');
        }
      }

      if (req.body.maxSell !== undefined) {
        updatedFields.maxSell = parseInt(req.body.maxSell, 10);
        if (isNaN(updatedFields.maxSell)) {
          return sendErrorResponse(res, 400, 'Invalid maxSell value');
        }
      }

      if (req.body.sellPercentage !== undefined) {
        updatedFields.sellPercentage = parseInt(req.body.sellPercentage, 10);
        if (isNaN(updatedFields.sellPercentage)) {
          return sendErrorResponse(res, 400, 'Invalid sellPercentage value');
        }
      }

      if (req.body.isJito !== undefined) {
        updatedFields.isJito = req.body.isJito;
      }

      if (req.body.isPercentage !== undefined) {
        updatedFields.isPercentage = req.body.isPercentage;
      }

      if (req.body.isRange !== undefined) {
        updatedFields.isRange = req.body.isRange;
      }

      const updatedSetting = await SellSettings.findByIdAndUpdate(
        id, 
        { $set: updatedFields },
        { new: true }
      );

      if (!updatedSetting) {
        return sendErrorResponse(res, 404, 'Settings not found');
      }

      res.status(200).json({ message: 'Settings updated successfully' });
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  },
  deleteSellSettings: async (req, res) => {
    try {
      const { settingsName, userId } = req.body;
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(400).json({ error: 'Wallet not registered' });
      }

      if (!settingsName) {
        return sendErrorResponse(res, 400, 'Settings name is required');
      }

      const settings = await SellSettings.findOne({user:userId}, {settingsName} );

      if (!settings) {
        return sendErrorResponse(res, 404, 'Settings not found');
      }

      const deletedSetting = await SellSettings.findOneAndDelete( {user:userId},{settingsName});

      if (!deletedSetting) {
        return sendErrorResponse(res, 404, 'Settings not found');
      }

      res.status(200).json({ message: 'Settings deleted successfully' });
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  },
};
