const { JsonRpcProvider } = require("ethers");

const ethersProvider = (rpcUrl) => {
    return new JsonRpcProvider(rpcUrl);
};

module.exports = ethersProvider;
