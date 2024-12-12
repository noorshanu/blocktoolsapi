const { sendErrorResponse } = require('../helpers');
const Li_Routeraddress = require('../models/liRouterAddress.mode');
const User = require('../models/User');





module.exports = {
  // Add new router address
  addRouterAdress: async (req, res) => {
    try {
      const { networkId, address, walletAddress } = req.body;
      
          const user = await User.findOne({  walletAddress });
          if (!user) {
            return res.status(400).json({ error: 'Wallet not registered' });
          }
  

      if (!networkId) {
        return sendErrorResponse(res, 400, 'Network Id is required');
      }
      if (!address) {
        return sendErrorResponse(res, 400, 'A valid address is required');
      }

      const newRouter = new Li_Routeraddress({
        user: walletAddress,
        networkId,
        routerAddress: address,
      });

      await newRouter.save();
      res.status(200).json(newRouter);
    } catch (err) {
      sendErrorResponse(res, 500, err);
    }
  },

  // Edit router address
  editRouterAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const { networkId, address,walletAddress } = req.body;
      const user = await User.findOne({ walletAddress });
          if (!user) {
            return res.status(400).json({ error: 'Wallet not registered' });
          }
      const updatedRouter = await Li_Routeraddress.findByIdAndUpdate(
        id,
        { networkId, routerAddress: address },
        { new: true, runValidators: true }
      );

      if (!updatedRouter) {
        return sendErrorResponse(res, 404, 'Router address not found');
      }

      res.status(200).json(updatedRouter);
    } catch (err) {
      sendErrorResponse(res, 500, err);
    }
  },

  // Delete router address
  deleteRouterAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const {walletAddress} = req.body;
      const user = await User.findOne({ walletAddress });
          if (!user) {
            return res.status(400).json({ error: 'Wallet not registered' });
          }

      const deletedRouter = await Li_Routeraddress.findByIdAndDelete(id);

      if (!deletedRouter) {
        return sendErrorResponse(res, 404, 'Router address not found');
      }

      res.status(200).json({ message: 'Router address deleted successfully' });
    } catch (err) {
      sendErrorResponse(res, 500, err);
    }
  },

  // List router addresses
  listRouterAddress: async (req, res) => {
    try {
      const {walletAddress}=req.body;
      const user = await User.findOne({ walletAddress });
          if (!user) {
            return res.status(400).json({ error: 'Wallet not registered' });
          }
      const routers = await Li_Routeraddress.find({ user:walletAddress });
      res.status(200).json(routers);
    } catch (err) {
      sendErrorResponse(res, 500, err);
    }
  },
};
