const ethers = require('ethers');
const crypto = require('crypto');
const User = require('../models/User');

const registerUser = async (req, res) => {
  const { walletAddress, userId } = req.body;



  try {
   
    if (!userId && !walletAddress) {
      return res.status(400).json({ error: 'Either User ID or Wallet Address Required' });
    }

 
    // if (normalizedWalletAddress && !ethers.isAddress(normalizedWalletAddress)) {
    //   return res.status(400).json({ error: 'Invalid wallet address' });
    // }

    let existingUser = null;

   
    if (walletAddress) {
      existingUser = await User.findOne({ walletAddress });
    }

    
    if ( userId) {
      existingUser = await User.findOne({ userId });
    }

   
    if (existingUser) {
      return res.status(200).json({ error: 'User already registered' });
    }

    
     const newUser = new User();
     if (walletAddress) {
      newUser.walletAddress = walletAddress;
    } else if (userId) {
      newUser.user =  userId;
    }

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully', newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { registerUser };
