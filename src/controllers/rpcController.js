const ethers = require('ethers');
const User = require('../models/User');
const RpcUrl = require('../models/RpcUrl');

// Helper function to validate the RPC URL
const isValidRpcUrl = async (rpcUrl) => {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    await provider.getBlockNumber(); 
    console.log('RPC URL is valid', rpcUrl);
    return true;
  } catch (error) {
    return false;
  }
};

const saveRpcUrl = async (req, res) => {
  const { walletAddress, rpcUrl, name } = req.body;

  // Validate the wallet address
  if (!ethers.isAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  // Validate the RPC URL
  const isValid = await isValidRpcUrl(rpcUrl);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid RPC URL' });
  }

  try {
    // Check if the wallet address is registered
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(400).json({ error: 'Wallet not registered' });
    }

    // Check if an RPC URL with the same name exists for this wallet
    const existingRpc = await RpcUrl.findOne({ walletAddress, name });
    if (existingRpc) {
      return res.status(400).json({ error: 'RPC URL with this name already exists' });
    }

    // Save the new RPC URL
    const newRpcUrl = new RpcUrl({
      walletAddress,
      rpcUrl,
      name,
    });
    await newRpcUrl.save();

    return res.status(201).json({ message: 'RPC URL saved successfully', newRpcUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
const deleteRpcUrl = async (req, res) => {
   const { walletAddress, name } = req.body;
 
   // Validate the wallet address
   if (!ethers.isAddress(walletAddress)) {
     return res.status(400).json({ error: 'Invalid wallet address' });
   }
 
   try {
     // Check if the wallet address is registered
     const user = await User.findOne({ walletAddress });
     if (!user) {
       return res.status(400).json({ error: 'Wallet not registered' });
     }
 
     // Find and delete the RPC URL associated with the wallet and name
     const deletedRpc = await RpcUrl.findOneAndDelete({ walletAddress, name });
     if (!deletedRpc) {
       return res.status(404).json({ error: 'RPC URL not found' });
     }
 
     return res.status(200).json({ message: 'RPC URL deleted successfully', deletedRpc });
   } catch (error) {
     console.error(error);
     return res.status(500).json({ error: 'Server error' });
   }
 };
 const updateRpcUrl = async (req, res) => {
   const { walletAddress, oldName, newName, rpcUrl } = req.body;
 
   // Validate the wallet address
   if (!ethers.isAddress(walletAddress)) {
     return res.status(400).json({ error: 'Invalid wallet address' });
   }
 
   // Validate the new RPC URL
   const isValid = await isValidRpcUrl(rpcUrl);
   if (!isValid) {
     return res.status(400).json({ error: 'Invalid RPC URL' });
   }
 
   try {
     // Check if the wallet address is registered
     const user = await User.findOne({ walletAddress });
     if (!user) {
       return res.status(400).json({ error: 'Wallet not registered' });
     }
 
     // Find the RPC URL and update its values
     const updatedRpc = await RpcUrl.findOneAndUpdate(
       { walletAddress, name: oldName },
       { rpcUrl, name: newName },
       { new: true }
     );
 
     if (!updatedRpc) {
       return res.status(404).json({ error: 'RPC URL not found' });
     }
 
     return res.status(200).json({ message: 'RPC URL updated successfully', updatedRpc });
   } catch (error) {
     console.error(error);
     return res.status(500).json({ error: 'Server error' });
   }
 };
 const listRpcUrls = async (req, res) => {
   const { walletAddress } = req.body;
 
   // Validate the wallet address
   if (!ethers.isAddress(walletAddress)) {
     return res.status(400).json({ error: 'Invalid wallet address' });
   }
 
   try {
     // Check if the wallet address is registered
     const user = await User.findOne({ walletAddress });
     if (!user) {
       return res.status(400).json({ error: 'Wallet not registered' });
     }
 
     // Find all RPC URLs associated with the wallet address
     const rpcUrls = await RpcUrl.find({ walletAddress });
 
     if (!rpcUrls || rpcUrls.length === 0) {
       return res.status(404).json({ error: 'No RPC URLs found for this wallet' });
     }
 
     return res.status(200).json({ rpcUrls });
   } catch (error) {
     console.error(error);
     return res.status(500).json({ error: 'Server error' });
   }
 };
 
 
module.exports = { saveRpcUrl , deleteRpcUrl , updateRpcUrl , listRpcUrls };
