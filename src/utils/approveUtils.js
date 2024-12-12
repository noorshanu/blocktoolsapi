// Import ethers library
const ethers = require("ethers");

async function approveTokenSpend(
  providerUrl,
  privateKey,
  tokenAddress,
  spenderAddress,
  amountInEther
) {
  // Connect to Ethereum network
  const provider = new ethers.JsonRpcProvider(providerUrl);

  // Create wallet instance from private key and connect to provider
  const wallet = new ethers.Wallet(privateKey, provider);

  // Define ERC-20 token ABI
  const erc20Abi = [
    "function approve(address spender, uint256 amount) public returns (bool)"
  ];

  // Create contract instance
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, wallet);

  // Convert amount from Ether to Wei
  const amountInWei = ethers.parseEther(amountInEther);

  // Send approve transaction
  try {
    const tx = await tokenContract.approve(spenderAddress, amountInWei);
    console.log("Transaction sent. Waiting for confirmation...");
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed!", receipt);
    return receipt
  } catch (error) {
    console.error("Error approving token spend:", error);
  }
}

// Export the module
module.exports = approveTokenSpend;
