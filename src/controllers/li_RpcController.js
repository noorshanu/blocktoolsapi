
const { sendErrorResponse } = require("../helpers");
const Li_Rpc = require("../models/liRpc.model");
const User = require("../models/User");



module.exports = {
    // Add new RPC
addRpc: async (req, res) => {
    try {
      const { networkId, walletAddress,rpcUrl,userId } = req.body;
      
    if (!userId && !walletAddress) {
      return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
    }
      if (!networkId) {
        return sendErrorResponse(res, 400, "Network Id is required");
      }
      if (!rpcUrl) {
        return sendErrorResponse(res, 400, "rpcUrl is required");
      }
      const userExists = await User.findOne({ $or: [{ user:userId }, { walletAddress }] });
    if (!userExists) {
      return res.status(400).json({ error: 'Wallet not registered' });
    }
      let newRpc = {
        user: walletAddress,
        networkId,
        rpcUrl,
      };
      if(userId){
        newRpc.user = userId;
      }else{
        newRpc.walletAddress = walletAddress;
      }
     const newRpcData = new Li_Rpc(newRpc)
      await newRpcData.save();
      res.status(200).json(newRpc);
    } catch (err) {
      sendErrorResponse(res, 500, err);
    }
  },
  
  // Edit RPC 
  editRpc: async (req, res) => {
    try {

      const {  rpcUrl,walletAddress,userId } = req.body; 

    if (!userId && !walletAddress) {
      return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
    }
    const userExists = await User.findOne({ $or: [{ user:userId }, { walletAddress }] });
    if (!userExists) {
      return res.status(400).json({ error: 'Wallet not registered' });
    }

     let exist = await Li_Rpc.findOne({rpcUrl});
     if (exist) {
      return sendErrorResponse(res, 404, "RPC already exist");
    }
  
      const updatedRpc = await Li_Rpc.findByIdAndUpdate(
        {rpcUrl},
        {  rpcUrl },
        { new: true, runValidators: true }
      );
  
      if (!updatedRpc) {
        return sendErrorResponse(res, 404, "RPC not found");
      }
  
      res.status(200).json(updatedRpc);
    } catch (err) {
      sendErrorResponse(res, 500, err);
    }
  },
  
  // Delete RPC
  deleteRpc: async (req, res) => {
    try {
      const { rpcUrl,walletAddress,userId } = req.body;

    if (!userId && !walletAddress) {
      return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
    }
    const query = userId ? { user: userId } : { walletAddress };
      const deletedRpc = await Li_Rpc.findByIdAndDelete({query,rpcUrl});
  
      if (!deletedRpc) {
        return sendErrorResponse(res, 404, "RPC not found");
      }
  
      res.status(200).json({ message: "RPC deleted successfully" });
    } catch (err) {
      sendErrorResponse(res, 500, err);
    }
  },
  
  // List RPCs
  listRpc: async (req, res) => {
    try {
      
      const {  networkId , walletAddress,userId} = req.body;
      if (!userId && !walletAddress) {
        return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
      }
      const query = userId ? { user: userId } : { walletAddress };
      const user = await User.findOne(query);
      if (!user) {
        return res.status(400).json({ error: 'Wallet not registered' });
      }
      const rpcs = await Li_Rpc.find({ networkId },{ _id: 0, rpcUrl: 1, updatedAt: 1 }); 
      res.status(200).json(rpcs);
    } catch (err) {
      sendErrorResponse(res, 500, err);
    }
  },
  
}