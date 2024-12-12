// const bitcoinHelpers = require("./bitcoinHelpers");
const ethereumHelpers = require('./ethereumHelpers');
const solanaHelpers = require('./solanaHelpers');

const getBalance = async (network, rpcUrl, address, tokenAddress) => {
  try {
    if (network === 'ethereum') {
      return await ethereumHelpers.getBalance({
        rpcUrl,
        address,
        tokenAddress,
      });
    } else if (network === 'solana') {
      return await solanaHelpers.getBalance({
        rpcUrl,
        address,
        tokenAddress,
      });
    } else if (network.includes('bitcoin')) {
      //  return await bitcoinHelpers.getBalance({ network, address });
    }

    throw new Error('Invalid network');
  } catch (error) {
    throw error;
  }
};

module.exports = getBalance;
