const ethers = require('ethers');
const { POOL_CREATOR_ABI } = require('../abi/poolcreator');

async function addToPool(walletSession, tokenAddress, poolCreatorAddress, wethAddress, ethAmount, tokenAmount, snipeAmount, sendValue) {
  const poolCreatorContract = new ethers.Contract(poolCreatorAddress, POOL_CREATOR_ABI).connect(walletSession);

  const tx = await poolCreatorContract.addToPoolV2(
    tokenAddress, 
    tokenAmount, 
    ethAmount, 
    snipeAmount, 
    [wethAddress, tokenAddress], 
    { value: sendValue }
  );

  const receipt = await tx.wait();
  return receipt;
}

module.exports = { addToPool };
