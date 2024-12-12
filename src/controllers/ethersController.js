const { sendErrorResponse } = require('../helpers');
const getBalance = require('../helpers/getBalance');
const User = require('../models/User');

module.exports = {
  getEthBalance: async(req, res) => {
    const  dataArray  = req.body;

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    const balancePromises =  dataArray.map(async (data) => {
      const { network, rpcUrl, walletAddress, tokenAddress } = data;

      try {
            const balance = await getBalance(network, rpcUrl, walletAddress, tokenAddress);
            return ({
                walletAddress,
                balance,
            });
        } catch (error) {
            return ({
                walletAddress,
                error: error.message || 'Error fetching balance',
            });
        }
    });

    Promise.all(balancePromises)
      .then((allBalances) => {
        return res.status(200).json({ allBalances });
      })
      .catch((err) => {
        sendErrorResponse(res, 500, err.message);
      });
  },
};
