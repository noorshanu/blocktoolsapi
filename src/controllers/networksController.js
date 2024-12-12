const { sendErrorResponse } = require("../helpers");
const Li_Network = require("../models/linetwork.model");

const User = require("../models/User");


module.exports = {

   // Create new network
addNewNetwork: async (req, res) => {
    try {
      const { networkName, chainId,nativeCurrencyName,explorerUrl,nativeCurrencySymbol, isEvm ,walletAddress,userId} = req.body;
      if (!userId && !walletAddress) {
        return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
      }
      const query = userId ? { user: userId } : { walletAddress };
      const user = await User.findOne(query);
      if (!user) {
        return res.status(400).json({ error: 'Wallet or user ID not registered' });
      }
      let networkLogo;
      if (req.file?.path) {
        networkLogo = "/" + req.file.path.replace(/\\/g, "/");
      }
      
      if (networkLogo !== undefined) {
        return sendErrorResponse(res, 400, "Network Logo is required");
      }
      if (!networkName) {
        return sendErrorResponse(res, 400, "Network is required");
      }
      if (!chainId) {
        return sendErrorResponse(res, 400, "chainId is required");
      }
      if (!nativeCurrencyName) {
        return sendErrorResponse(res, 400, "nativeCurrencyName is required");
      }
      if (!explorerUrl) {
        return sendErrorResponse(res, 400, "explorerUrl is required");
      }
      if (!nativeCurrencySymbol) {
        return sendErrorResponse(res, 400, "nativeCurrencySymbol is required");
      }
      const numericChainId = parseInt(chainId); 
      const newNetwork = {
        user: req.user._id,
        networkName,
        chainId:numericChainId,
        nativeCurrencyName,
        explorerUrl,
        networkLogo,
        isEvm,
      };
      if (userId) {
        newNetwork.user = userId;
      }else{
        newNetwork.walletAddress = walletAddress;
      }
    const newNetworkdata = new Li_Network(newNetwork)
      await newNetworkdata.save();
      res.status(200).json({ message: "Network created successfully" });
    } catch (err) {
      sendErrorResponse(res, 500, err);
    }
  },
  
  // Edit network
  editNetwork: async (req, res) => {
    try {
      const { networkName, chainId, nativeCurrencyName, explorerUrl,nativeCurrencySymbol, isEvm,walletAddress } = req.body;
  
      const user = await User.findOne({walletAddress });
          if (!user) {
            return res.status(400).json({ error: 'Wallet not registered' });
          }
      if (!chainId) {
        return sendErrorResponse(res, 400, "chainId is required");
      }
  
      const numericChainId = parseInt(chainId);
  
      
      const network = await Li_Network.findOne({ chainId: numericChainId });
      if (!network) {
        return sendErrorResponse(res, 404, "Network not found");
      }
  
      
      const updateFields = {};
  
     
      if (networkName !== undefined) updateFields.networkName = networkName;
      if (nativeCurrencyName !== undefined) updateFields.nativeCurrencyName = nativeCurrencyName;
      if (explorerUrl !== undefined) updateFields.explorerUrl = explorerUrl;
      if (nativeCurrencySymbol !== undefined) updateFields.nativeCurrencySymbol = nativeCurrencySymbol;
      if (isEvm !== undefined) updateFields.isEvm = isEvm;
  
      
      let networkLogo = network.networkLogo; 
      if (req.file?.path) {
        networkLogo = "/" + req.file.path.replace(/\\/g, "/");
      }
      updateFields.networkLogo = networkLogo;
  
      
      await Li_Network.updateOne({ chainId: numericChainId }, updateFields);
  
  
      res.status(200).json({ message: "Network updated successfully" });
    } catch (err) {
      sendErrorResponse(res, 500, err.message || "Internal server error");
    }
  },
  
  
  
  // Delete network
  deleteNetwork: async (req, res) => {
    try {
 
      const {  chainId,walletAddress,userId } = req.body;

    if (!userId && !walletAddress) {
      return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
    }
    const query = userId ? { user: userId } : { walletAddress };
      const user = await User.findOne(query);
          if (!user) {
            return res.status(400).json({ error: 'Wallet not registered' });
          }
      const numericChainId = parseInt(chainId); 
      const deletedNetwork = await Li_Network.findByIdAndDelete({chainId:numericChainId});
  
      if (!deletedNetwork) {
        return sendErrorResponse(res, 404, "Network not found");
      }
  
      res.status(200).json({ message: "Network deleted successfully" });
    } catch (err) {
      sendErrorResponse(res, 500, err);
    }
  },
  
  // List networks
  listNetworks: async (req, res) => {
    try {
        
const {userId,walletAddress} = req.body
if (!userId && !walletAddress) {
  return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
}
const query = userId ? { user: userId } : { walletAddress };
         const networks = await Li_Network.find(query);
        
        if (networks.length === 0) {
            return res.status(404).json({ message: 'No networks found.' });
        }

        res.status(200).json(networks);
    } catch (err) {
        console.error('Error fetching networks:', err);
        sendErrorResponse(res, 500, err);
    }
},

  
};
