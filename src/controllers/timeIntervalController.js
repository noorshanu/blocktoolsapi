const { BuySettings, SellSettings, TimeInterval } = require('../models');
const { sendErrorResponse } = require('../helpers');
const User = require('../models/User');

module.exports = {
  createTimeInterval: async (req, res) => {
    try {
      const { intervalType, settingsId, interval, walletAddress, userId } =
        req.body;
      if (!userId && !walletAddress) {
        return res
          .status(400)
          .json({ error: 'Either User ID or Wallet Address Required' });
      }
      const query = userId ? { user: userId } : { walletAddress };
      const user = await User.findOne(query);
      if (!user) {
        return res
          .status(400)
          .json({ error: 'Wallet or user ID not registered' });
      }

      let validSettings;
      if (intervalType === 'buy') {
        validSettings = await BuySettings.findById(settingsId);
      } else if (intervalType === 'sell') {
        validSettings = await SellSettings.findById(settingsId);
      }

      if (!validSettings) {
        return sendErrorResponse(
          res,
          400,
          `Invalid settingsID for ${intervalType} settings`
        );
      }

      const intervalInMs = parseInt(interval, 10);

      if (isNaN(intervalInMs) || intervalInMs <= 0) {
        return sendErrorResponse(
          res,
          400,
          'Interval must be a positive number in milliseconds.'
        );
      }

      const newTimeIntervalData = {
        user: walletAddress,
        intervalType,
        settingsId,
        interval: intervalInMs,
      };
if(userId){
    newTimeIntervalData.user = userId;
}else{
    newTimeInterval.walletAddress = walletAddress
}
    const  newTimeInterval = new TimeInterval(newTimeIntervalData)
      await newTimeInterval.save();

      res.status(201).json(newTimeInterval);
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  },
  getAllTimeIntervals: async (req, res) => {
    try {
      const { walletAddress, userId } = req.body;
      if (!userId && !walletAddress) {
        return res
          .status(400)
          .json({ error: 'Either User ID or Wallet Address Required' });
      }
      const query = userId ? { user: userId } : { walletAddress };
      const timeIntervals = await TimeInterval.find(query).select(
        'settingsId intervalType interval updatedAt'
      );
      res.status(200).json(timeIntervals);
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  },
  editTimeInterval: async (req, res) => {
    try {
      const { id } = req.params;
      const { walletAddress, userId } = req.body;
      if (!userId && !walletAddress) {
        return res
          .status(400)
          .json({ error: 'Either User ID or Wallet Address Required' });
      }
      const query = userId ? { user: userId } : { walletAddress };
      const user = await User.findOne(query);
      if (!user) {
        return res
          .status(400)
          .json({ error: 'Wallet or user ID not registered' });
      }
      const timeInterval = await TimeInterval.findById(id);
      if (!timeInterval) {
        return sendErrorResponse(res, 404, 'Time interval not found');
      }

      const updatedFields = {};

      if (req.body.intervalType) {
        if (
          req.body.intervalType !== 'buy' &&
          req.body.intervalType !== 'sell'
        ) {
          return sendErrorResponse(
            res,
            400,
            'Invalid intervalType. Must be "buy" or "sell".'
          );
        }
        updatedFields.intervalType = req.body.intervalType;
      }

      if (req.body.settingsId) {
        let validSettings;
        if (req.body.intervalType === 'buy') {
          validSettings = await BuySettings.findById(req.body.settingsId);
        } else if (req.body.intervalType === 'sell') {
          validSettings = await SellSettings.findById(req.body.settingsId);
        }

        if (!validSettings) {
          return sendErrorResponse(
            res,
            400,
            `Invalid settingsID for ${req.body.intervalType} settings`
          );
        }
        updatedFields.settingsId = req.body.settingsId;
      }

      if (req.body.interval !== undefined) {
        const intervalInMs = parseInt(req.body.interval, 10);
        if (isNaN(intervalInMs) || intervalInMs <= 0) {
          return sendErrorResponse(
            res,
            400,
            'Interval must be a positive number in milliseconds.'
          );
        }
        updatedFields.interval = intervalInMs;
      }

      Object.assign(timeInterval, updatedFields);
      await timeInterval.save();

      res.status(200).json({ message: 'Time interval updated successfully' });
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  },

  deleteTimeInterval: async (req, res) => {
    try {
      const { id } = req.params;
      const { walletAddress, userId } = req.body;
      if (!userId && !walletAddress) {
        return res
          .status(400)
          .json({ error: 'Either User ID or Wallet Address Required' });
      }
      const query = userId ? { user: userId } : { walletAddress };
      const user = await User.findOne(query);
      if (!user) {
        return res
          .status(400)
          .json({ error: 'Wallet or user ID not registered' });
      }
      const timeInterval = await TimeInterval.findByIdAndDelete(id);
      if (!timeInterval) {
        return sendErrorResponse(res, 404, 'Time interval not found');
      }
      res.status(204).send({ message: 'Time interval deleted successfully' });
    } catch (err) {
      sendErrorResponse(res, 500, err.message);
    }
  },
};
