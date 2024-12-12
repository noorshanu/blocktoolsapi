const solanaWeb3 = require("@solana/web3.js");

const solanaProvider = (rpcUrl) => {
    return new solanaWeb3.Connection(rpcUrl);
};

module.exports = solanaProvider;
