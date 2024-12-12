const { sendSolana, solBalance, getSolBalance, sendSolanaBulk } = require('../utils/solTransfer');
;
const Li_Wallet = require('../models/liWallet.model');

const { sendErrorResponse } = require('../helpers');
const Solanatransfer = require('../models/solanaTransfer.model');


module.exports = {
  transferSolana: async (req, res) => {
    try {
      const { from, to, amount, rpc } = req.body;

      if (!from || !to || !amount || !rpc) {
        return sendErrorResponse(
          res,
          400,
          'Sender, recipient, amount and rcp Url are required.'
        );
      }

      


      const wallet = await Li_Wallet.findOne({ publicKey: from }).select(
        'user privateKey'
      );

      if (!wallet || !wallet.privateKey) {
        return sendErrorResponse(
          res,
          400,
          'Sender wallet not found or private key is missing.'
        );
      }

      if (!wallet.user.equals( walletAddress)) {
        return sendErrorResponse(res, 403, 'Not authorized');
      }

      const privateKey = wallet.privateKey;

      const balance = await getSolBalance(rpc,from)

      if (balance === 0 || balance < amount) {
        return sendErrorResponse(
            res,
            400,
            'Insufficient balance.'
          );
      }
      
      const signature = await sendSolana(privateKey, to, amount, rpc);

      if (signature) {
        const newSol = new Solanatransfer({
          user: walletAddress,
          from,
          to,
          amount,
          rpc,
          isSuccess: true,
          signature,
        });

        await newSol.save();
      }
      return res.status(200).json({ signature, isSuccess: true });
    } catch (err) {
        sendErrorResponse(res, 500, err.message);
    }
  },
  getBalanceCheck :async (req, res) => {
    try {
      const { from,  rpc } = req.body;

      if (!from  || !rpc) {
        return sendErrorResponse(
          res,
          400,
          'Sender and rcp Url are required.'
        );
      }

      const wallet = await Li_Wallet.findOne({ publicKey: from }).select(
        'user'
      );

      if (!wallet) {
        return sendErrorResponse(res, 404, 'Wallet not found');
      }
      
      
      if (!wallet.user.equals( walletAddress)) {
        return sendErrorResponse(res, 403, 'Not authorized');
      }

      const balance = await getSolBalance(rpc,from)
      
      return res.status(200).json({ balance, publicKey:from });
    } catch (err) {
        sendErrorResponse(res, 500, err.message);
    }
  },

};
