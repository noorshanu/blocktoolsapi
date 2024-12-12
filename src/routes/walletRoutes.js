const express = require('express');
const { createWorkerWallet , listWallets,downloadListWallets, listWorkerWallets , setWalletType , getBalance , getAllBalances ,send , sendToken, getAllCoinBalances, getNewBalance, createWorkerWalletToken,listWorkerWalletsByToken, editWorkerWalletToken, deleteWorkerWalletToken, sendMultiToken, multiSend, downloadWorkerWalletsByToken,deleteWorkerWallet,getDevWalletByToken} = require('../controllers/walletController');
const Ethtransfer = require('../models/solanaTransfer.model');

const router = express.Router();

// Route for creating worker wallets
router.post('/create-worker-wallet', createWorkerWallet);
router.post('/list-worker-wallets', listWorkerWallets);
router.post('/list-wallets', listWallets);
router.post('/delete-wallet', deleteWorkerWallet);
router.post('/set-wallet-type', setWalletType);
router.post('/get-balance', getBalance);
router.post('/get-new-balance', getNewBalance);
router.post('/get-all-balances', getAllBalances);
router.post('/download-list-wallets', downloadListWallets);
router.post('/download-list-token-wallets', downloadWorkerWalletsByToken);
router.post('/get-all-coin-balances', getAllCoinBalances);
router.post('/send', async (req, res) => {
   const { ownerWalletAddress, rpcUrl, fromAddress, toAddress, amount } = req.body;
 
   try {
     const result = await send(ownerWalletAddress, rpcUrl, fromAddress, toAddress, amount);
     const isSuccess = result && result.hash ? true : false;
     const newEthTransfer = new Ethtransfer({
       ownerWallet:ownerWalletAddress,
       from:fromAddress,
       to:toAddress,
       isSuccess:isSuccess,
       signature:result.hash
     })
     await newEthTransfer.save()
     return res.status(200).json(result);
   } catch (error) {
     return res.status(400).json({ error: error.message });
   }
 });
 router.post('/sendToken', async (req, res) => {
   const { ownerWalletAddress, rpcUrl, tokenAddress, fromAddress, toAddress, amount } = req.body;
 
   try {
     const result = await sendToken(ownerWalletAddress, rpcUrl, tokenAddress, fromAddress, toAddress, amount);
     const isSuccess = result && result.hash ? true : false;
      const newEthTransfer = new Ethtransfer({
        ownerWallet:ownerWalletAddress,
        from:fromAddress,
        to:toAddress,
        isSuccess:isSuccess,
        signature:result.hash
      })
      await newEthTransfer.save()
     return res.status(200).json(result);
   } catch (error) {
     return res.status(400).json({ error: error.message });
   }
 });

router.post('/create-worker-wallet-token', createWorkerWalletToken);
router.post('/list-worker-wallet-token', listWorkerWalletsByToken);
router.post('/get-devwallet', getDevWalletByToken);
router.put('/edit-worker-wallet-token',editWorkerWalletToken)
router.delete('/delete-worker-wallet-token',deleteWorkerWalletToken)
router.post('/sendMultiToken',sendMultiToken);
router.post('/multi-send',multiSend);
 
module.exports = router;

