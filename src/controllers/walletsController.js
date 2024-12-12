
const { sendErrorResponse } = require("../helpers");
const solanaHelpers = require("../helpers/solanaHelpers");
const Li_Wallet = require("../models/liWallet.model");
const User = require("../models/User");
const Wallet = require("../models/wallet.model");



module.exports = {
    getAllWallets: async (req, res) => {
        try {
          const {walletAddress} = req.body;
          console.log(req.body);
          
          const user = await User.findOne({ walletAddress });
          if (!user) {
            return res.status(400).json({ error: 'Wallet not registered' });
          }
            const wallets = await Wallet.find({ walletAddress});

            res.status(200).json(wallets);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    listAllWallets: async (req, res) => {
      try {
          console.log(req.body);
  
          const { userId, walletAddress } = req.body;
          
          let user;
  
          
          if (userId) {
              user = await User.findOne({ userId });
          }
  
         
          if (!user && walletAddress) {
              user = await User.findOne({ walletAddress });
          }
  
          
          if (!user) {
              return res.status(400).json({ error: 'User not found or Wallet not registered' });
          }
  
        if(walletAddress){
          const wallets = await Li_Wallet.find(
            { walletAddress },
            { _id: 0, publicKey: 1, isWorker: 1, isActive: 1, updatedAt: 1 }
        );

        res.status(200).json(wallets);
        }
        if(userId){
          const wallets = await Li_Wallet.find(
            { userId },
            { _id: 0, publicKey: 1, isWorker: 1, isActive: 1, updatedAt: 1 }
        );

        res.status(200).json(wallets);
        }
          
      } catch (err) {
          sendErrorResponse(res, 500, err);
      }
  },
  addWallets: async (req, res) => {
    try {
        const { networkId, isWorker, isActive, walletAddress, userId } = req.body;
        console.log("backend call coming",userId);
        

        const number = 1;
        let user;

        if (userId) {
            user = await User.findOne({ userId });
        }

        if (!user && walletAddress) {
            user = await User.findOne({ walletAddress }); 
        }

        
        if (!user) {
            return res.status(400).json({ error: 'User not found or Wallet not registered' });
        }

        if (!number || number <= 0) {
            return sendErrorResponse(res, 400, "A valid number of wallets is required");
        }

        console.log("user Details",user);
        
            const solanaWallet = await solanaHelpers.createWallet();

            const solWallet = new Li_Wallet({
                user: walletAddress,  
                userId,         
                privateKey: solanaWallet?.privateKey,
                publicKey: solanaWallet?.address,
                isWorker:isWorker?isWorker:false,
                isActive:isActive?isActive:false,
            });

            await solWallet.save();
       
        res.status(200).json({ message: `${number} wallet(s) created successfully` });
    } catch (err) {
       
        sendErrorResponse(res, 500, err.message || "Internal server error");
    }
}

};
