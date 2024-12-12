const ethers = require('ethers');
const WorkerWallet = require('../models/WorkerWallet');
const RPCUrl = require('../models/RpcUrl');
const erc20Abi = require('../abi/erc20.json');
const Li_Network = require('../models/linetwork.model');
const { Parser } = require('json2csv');
const Ethtransfer = require('../models/solanaTransfer.model');
const User = require('../models/User');
const Token = require('../models/token');

const createWorkerWallet = async (req, res) => {
  const { ownerWallet, number, userId } = req.body;
  if (!userId && !ownerWallet) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }
  //Validate the owner wallet address
  if (ownerWallet) {
    if (!ethers.isAddress(ownerWallet)) {
      return res.status(400).json({ error: 'Invalid owner wallet address' });
    }

    if (!number || number <= 0) {
      return res
        .status(400)
        .json({ error: 'Invalid number of wallets specified' });
    }
  }

  try {
    const createdWallets = [];
    if (ownerWallet) {
      for (let i = 0; i < number; i++) {
        const wallet = ethers.Wallet.createRandom();

        const workerWallet = new WorkerWallet({
          ownerWallet,
          walletAddress: wallet.address,
          privateKey: wallet.privateKey,
          isFundingWallet: false,
          isWorkerWallet: true,
        });

        await workerWallet.save();

        createdWallets.push({
          walletAddress: wallet.address,
          privateKey: wallet.privateKey,
        });
      }

      return res.status(201).json({
        message: `${number} wallets created successfully`,
        createdWallets,
      });
    } else {
      const wallet = ethers.Wallet.createRandom();

      const workerWallet = new WorkerWallet({
        userId,
        walletAddress: wallet.address,
        privateKey: wallet.privateKey,
        isFundingWallet: false,
        isWorkerWallet: true,
      });

      await workerWallet.save();

      createdWallets.push({
        walletAddress: wallet.address,
        privateKey: wallet.privateKey,
      });

      return res.status(201).json({
        message: 'Single wallet created successfully',
        createdWallets,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
const listWorkerWallets = async (req, res) => {
  const { ownerWallet ,userId} = req.body;
  console.log(ownerWallet);
  if (!userId && !ownerWallet) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }
if(ownerWallet){

  if (!ethers.isAddress(ownerWallet)) {
    return res.status(400).json({ error: 'Invalid owner wallet address' });
  }
}
  

  try {
    // Find all worker wallets associated with the owner wallet address
    const query = userId ? { user: userId } : { ownerWallet };
   
    const workerWallets = await WorkerWallet.find(query);

    if (!workerWallets || workerWallets.length === 0) {
      return res.status(404).json({ error: 'No wallets found for this owner' });
    }

    // Return the wallet address, isFundingWallet, and isWorkerWallet fields
    const walletDetails = workerWallets.map((wallet) => ({
      walletAddress: wallet.walletAddress,
      privateKey: wallet.privateKey,
      isFundingWallet: wallet.isFundingWallet,
      isWorkerWallet: wallet.isWorkerWallet,
    }));

    console.log(walletDetails);

    return res.status(200).json({ walletDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
const listWallets = async (req, res) => {
  const { ownerWallet, userId, page = 1, limit = 10 } = req.body; // Default values

  // Validate the owner wallet address
  // if (!ethers.isAddress(ownerWallet)) {
  //   return res.status(400).json({ error: "Invalid owner wallet address" });
  // }

  // Convert page and limit to numbers
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // Ensure page and limit are positive numbers
  if (pageNum < 1 || limitNum < 1) {
    return res
      .status(400)
      .json({ error: 'Page and limit must be positive numbers' });
  }

  try {
    // Find all worker wallets associated with the owner wallet address, applying pagination
    const workerWallets = await WorkerWallet.find({ userId })
      .skip((pageNum - 1) * limitNum) // Skip the previous pages
      .limit(limitNum); // Limit the number of results

    if (!workerWallets || workerWallets.length === 0) {
      return res.status(200).json({ error: 'No wallets found for this owner' });
    }

    // Return the wallet address, isFundingWallet, and isWorkerWallet fields
    const walletDetails = workerWallets.map((wallet) => ({
      walletAddress: wallet.walletAddress,
      privateKey: wallet.privateKey,
      isFundingWallet: wallet.isFundingWallet,
      isWorkerWallet: wallet.isWorkerWallet,
    }));

    // Count total wallets for pagination
    const totalWallets = await WorkerWallet.countDocuments({ userId });

    return res.status(200).json({
      total: totalWallets,
      page: pageNum,
      limit: limitNum,
      walletDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const downloadListWallets = async (req, res) => {
  const { ownerWallet ,userId} = req.body; // Default values
  if (!userId && !ownerWallet) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }
  // Validate the owner wallet address
  if(ownerWallet){

    if (!ethers.isAddress(ownerWallet)) {
      return res.status(400).json({ error: 'Invalid owner wallet address' });
    }
  }

  try {
    const query = userId ? { user: userId } : { walletAddress:ownerWallet };
    const user = await User.findOne(query);
    if (!user) {
      return res
        .status(400)
        .json({ error: 'Wallet or user ID not registered' });
    }
    // Find all worker wallets associated with the owner wallet address, applying pagination
    const queryWallet = userId ? { user: userId } : { ownerWallet:ownerWallet };

    const workerWallets = await WorkerWallet.find(queryWallet);

    console.log(workerWallets);

    if (!workerWallets || workerWallets.length === 0) {
      return res.status(404).json({ error: 'No wallets found for this owner' });
    }

    // Return the wallet address, isFundingWallet, and isWorkerWallet fields
    const walletDetails = workerWallets.map((wallet) => ({
      walletAddress: wallet.walletAddress,
      privateKey: wallet.privateKey,
    }));

    const fields = ['walletAddress', 'privateKey'];
    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(walletDetails);

    res.header('Content-Type', 'text/csv');
    res.header(
      'Content-Disposition',
      'attachment; filename=wallet_details.csv'
    );

    return res.status(200).send(csvData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
// const setWalletType = async (req, res) => {
//   const { ownerWallet, walletAddresses, isFundingWallet, isWorkerWallet } = req.body;

//   // Validate the owner wallet address
//   if (!ethers.isAddress(ownerWallet)) {
//     return res.status(400).json({ error: 'Invalid owner wallet address' });
//   }

//   // Validate the wallet addresses
//   if (!Array.isArray(walletAddresses) || walletAddresses.length === 0) {
//     return res.status(400).json({ error: 'Wallet addresses must be a non-empty array' });
//   }

//   if (!Array.isArray(isFundingWallet) || !Array.isArray(isWorkerWallet) || walletAddresses.length !== isFundingWallet.length || walletAddresses.length !== isWorkerWallet.length) {
//     return res.status(400).json({ error: 'Mismatch in wallet addresses and wallet types array lengths' });
//   }

//   try {
//     // Loop through the provided wallet addresses
//     for (let i = 0; i < walletAddresses.length; i++) {
//       const walletAddress = walletAddresses[i];

//       // Check if the wallet address exists for the owner
//       const walletEntry = await WorkerWallet.findOne({ ownerWallet, walletAddress });

//       // If wallet does not exist for this owner, skip to the next one
//       if (!walletEntry) {
//         continue; // Skip to the next iteration
//       }

//       // Update the wallet type fields
//       walletEntry.isFundingWallet = isFundingWallet[i];
//       walletEntry.isWorkerWallet = isWorkerWallet[i];

//       // Save the updated wallet entry
//       await walletEntry.save();
//     }

//     return res.status(200).json({ message: 'Wallet types updated successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };
const setWalletType = async (req, res) => {
  const { ownerWallet, walletAddresses, isFundingWallet, isWorkerWallet,userId } =
    req.body; // Single boolean values
    if (!userId && !ownerWallet) {
      return res
        .status(400)
        .json({ error: 'Either User ID or Wallet Address Required' });
    }
  // Validate the owner wallet address
  if(ownerWallet){

    if (!ethers.isAddress(ownerWallet)) {
      return res.status(400).json({ error: 'Invalid owner wallet address' });
    }
  }
  const query = userId ? { user: userId } : { walletAddress:ownerWallet };
  const user = await User.findOne(query);
  if (!user) {
    return res
      .status(400)
      .json({ error: 'Wallet or user ID not registered' });
  }

  // Validate the wallet addresses
  if (!Array.isArray(walletAddresses) || walletAddresses.length === 0) {
    return res
      .status(400)
      .json({ error: 'Wallet addresses must be a non-empty array' });
  }

  // Validate that both isFundingWallet and isWorkerWallet are booleans
  if (
    typeof isFundingWallet !== 'boolean' ||
    typeof isWorkerWallet !== 'boolean'
  ) {
    return res.status(400).json({
      error: 'isFundingWallet and isWorkerWallet must be boolean values',
    });
  }

  try {
    // Loop through the provided wallet addresses
    for (const walletAddress of walletAddresses) {
      // Check if the wallet address exists for the owner
      const search = userId? {user:userId} : {ownerWallet}
      const walletEntry = await WorkerWallet.findOne({
        ...search,
        walletAddress,
      });

      // If wallet does not exist for this owner, skip to the next one
      if (!walletEntry) {
        continue; // Skip to the next iteration
      }

      // Update the wallet type fields
      walletEntry.isFundingWallet = isFundingWallet; // Set funding wallet type
      walletEntry.isWorkerWallet = isWorkerWallet; // Set worker wallet type

      // Save the updated wallet entry
      await walletEntry.save();
    }

    return res
      .status(200)
      .json({ message: 'Wallet types updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getBalance = async (req, res) => {
  const { rpcUrl, ownerAddress, walletAddress ,userId} = req.body;
  if (!userId && !ownerAddress) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }
  if(ownerAddress){
    // Validate the provided addresses
  if (!ethers.isAddress(ownerAddress)) {
    return res.status(400).json({ error: 'Invalid owner address' });
  }
  }
  

  if (!ethers.isAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    // Check if the RPC URL is valid
    const search = userId? {user:userId} : {walletAddress:ownerWallet}
    const rpcEntry = await RPCUrl.findOne({
      rpcUrl: rpcUrl,
      ...search
    });
    console.log(rpcEntry);
    if (!rpcEntry) {
      return res.status(404).json({ error: 'RPC URL not found for the owner' });
    }

    // Create a provider with the provided RPC URL
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Get the balance for the specified wallet address
    const balance = await provider.getBalance(walletAddress);

    // Convert the balance from Wei to Ether
    const balanceInEther = ethers.formatEther(balance);

    return res.status(200).json({
      walletAddress,
      balance: balanceInEther,
      rpcName: rpcEntry.name, // Assuming rpcName is a field in your RPCUrl model
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getNewBalance = async (req, res) => {
  const { networkName, walletAddress } = req.body;

  // Validate the provided addresses

  if (!ethers.isAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    const rpcUrls = [
      { name: 'Ethereum', url: 'https://eth.llamarpc.com' },
      { name: 'BSC', url: 'https://bsc-dataseed.binance.org/' },
      { name: 'BASE', url: 'https://mainnet.base.org/' },
      { name: 'Polygon', url: 'https://polygon-rpc.com' },
      { name: 'Arbitrum', url: 'https://arb1.arbitrum.io/rpc' },
    ];
    let rpcUrl;
    if (networkName === 'Ethereum') {
      rpcUrl = rpcUrls.find((entry) => entry.name === 'Ethereum').url;
    } else if (networkName === 'BSC') {
      rpcUrl = rpcUrls.find((entry) => entry.name === 'BSC').url;
    } else if (networkName === 'BASE') {
      rpcUrl = rpcUrls.find((entry) => entry.name === 'BASE').url;
    } else if (networkName === 'Polygon') {
      rpcUrl = rpcUrls.find((entry) => entry.name === 'Polygon').url;
    } else if (networkName === 'Arbitrum') {
      rpcUrl = rpcUrls.find((entry) => entry.name === 'Arbitrum').url;
    } else {
      console.error('Invalid network name provided');
    }

    // Create a provider with the provided RPC URL
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Get the balance for the specified wallet address
    const balance = await provider.getBalance(walletAddress);

    // Convert the balance from Wei to Ether
    const balanceInEther = ethers.formatEther(balance);

    return res.status(200).json({
      balance: balanceInEther,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getAllBalances = async (req, res) => {
  const { ownerAddress ,userId} = req.body;
  console.log(ownerAddress);
  if (!userId && !ownerAddress) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }
  // Validate the owner address
  if (!ethers.isAddress(ownerAddress)) {
    return res.status(400).json({ error: 'Invalid owner address' });
  }

  try {
    // Find all wallets created by the owner
    const search = userId? {user:userId} : {ownerWallet:ownerAddress}
    const wallets = await WorkerWallet.find(search);

    // If no wallets are found
    if (!wallets.length) {
      return res.status(404).json({ error: 'No wallets found for this owner' });
    }

    // Find all RPC URLs for the owner
    const query = userId? {user:userId} : {walletAddress:ownerAddress}

    const rpcUrls = await RPCUrl.find(query);

    // If no RPC URLs are found
    if (!rpcUrls.length) {
      return res
        .status(404)
        .json({ error: 'No RPC URLs found for this owner' });
    }

    // Prepare to collect balances
    const balances = [];

    // Loop through each wallet and each RPC URL
    for (const wallet of wallets) {
      for (const rpc of rpcUrls) {
        // Create a provider with the current RPC URL
        const provider = new ethers.JsonRpcProvider(rpc.rpcUrl);

        // Get the balance for the wallet address
        const balance = await provider.getBalance(wallet.walletAddress);

        // Convert the balance from Wei to Ether
        const balanceInEther = ethers.formatEther(balance);

        // Add to the balances array
        balances.push({
          walletAddress: wallet.walletAddress,
          rpcName: rpc.name, // Assuming rpcName is a field in your RPCUrl model
          balance: balanceInEther,
        });
      }
    }

    return res.status(200).json(balances);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getAllCoinBalances = async (req, res) => {
  const { walletAddress } = req.body;
  console.log(walletAddress);

  if (!ethers.isAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    const rpcUrls = [
      { name: 'ethBalance', url: 'https://eth.llamarpc.com' },
      { name: 'bscBalance', url: 'https://bsc-dataseed.binance.org/' },
      { name: 'baseBalance', url: 'https://mainnet.base.org/' },
      { name: 'polygonBalance', url: 'https://polygon-rpc.com' },
      { name: 'arbitrumBalance', url: 'https://arb1.arbitrum.io/rpc' },
    ];

    const balances = {};
    const balancePromises = rpcUrls.map(async (rpc) => {
      try {
        const provider = new ethers.JsonRpcProvider(rpc.url);
        const balance = await provider.getBalance(walletAddress);
        const balanceInEther = ethers.formatEther(balance);
        balances[rpc.name] = balanceInEther;
      } catch (error) {
        console.error(`Failed to fetch balance for ${rpc.name}:`, error);
        balances[rpc.name] = 'Error fetching balance';
      }
    });

    await Promise.all(balancePromises);

    console.log(balances);
    return res.status(200).json(balances);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const send = async (
  ownerWalletAddress,
  rpcUrl,
  fromAddress,
  toAddress,
  amount,
  userId
) => {
  // Validate input addresses and amount
  if (
    !ethers.isAddress(ownerWalletAddress) &&
    !userId ||
    !ethers.isAddress(fromAddress) ||
    !ethers.isAddress(toAddress) ||
    amount <= 0
  ) {
    throw new Error('Invalid input parameters.');
  }

  try {
    // Find the RPC URL based on the provided URL
    const query = userId? {user:userId} : {walletAddress:ownerWalletAddress}
    const rpcEntry = await RPCUrl.findOne({
      rpcUrl: rpcUrl,
     ...query
    });
    if (!rpcEntry) {
      throw new Error('RPC URL not found.');
    }

    // Find the sender wallet from the database
    const search = userId? {userId:userId} : {ownerWallet:ownerWalletAddress}
    const senderWallet = await WorkerWallet.findOne({
      walletAddress: fromAddress,
      ...search
    });
    if (!senderWallet) {
      throw new Error('Sender wallet not found for this owner.');
    }

    // Create a provider using the provided RPC URL
    const provider = new ethers.JsonRpcProvider(rpcEntry.rpcUrl);

    // Create a wallet instance using the private key
    const senderWalletInstance = new ethers.Wallet(
      senderWallet.privateKey,
      provider
    );

    // Check the balance of the sender wallet
    const balance = await provider.getBalance(fromAddress);
    const balanceInEther = ethers.formatEther(balance);

    // Check if the sender has enough balance
    if (parseFloat(balanceInEther) < parseFloat(amount)) {
      throw new Error('Insufficient balance in sender wallet.');
    }

    // Create a transaction object
    const tx = {
      to: toAddress,
      value: ethers.parseEther(amount.toString()), // Convert amount to Wei
    };

    // Send the transaction
    const transactionResponse = await senderWalletInstance.sendTransaction(tx);

    // Wait for the transaction to be mined
    await transactionResponse.wait();

    return {
      success: true,
      transactionHash: transactionResponse.hash,
      message: 'Transaction successful.',
    };
  } catch (error) {
    console.error('Error sending ETH:', error);
    throw new Error(error.message || 'An error occurred while sending ETH.');
  }
};

const sendToken = async (
  ownerWalletAddress,
  rpcUrl,
  tokenAddress,
  fromAddress,
  toAddress,
  amount,
  userId
) => {
  // Validate input addresses and amount
  
  if (
    !ethers.isAddress(ownerWalletAddress) &&
    !userId||
    !ethers.isAddress(fromAddress) ||
    !ethers.isAddress(toAddress) ||
    !ethers.isAddress(tokenAddress) ||
    amount <= 0
  ) {
    throw new Error('Invalid input parameters.');
  }

  try {
    // Find the RPC URL based on the provided URL
    const query = userId? {user:userId} : {walletAddress:ownerWalletAddress}
    const rpcEntry = await RPCUrl.findOne({
      rpcUrl: rpcUrl,
      ...query
    });
    if (!rpcEntry) {
      throw new Error('RPC URL not found.');
    }

    // Find the sender wallet from the database
    const search = userId? {userId:userId} : {ownerWallet:ownerWalletAddress}

    const senderWallet = await WorkerWallet.findOne({
      walletAddress: fromAddress,
      ...search
    });
    if (!senderWallet) {
      throw new Error('Sender wallet not found for this owner.');
    }

    // Create a provider using the provided RPC URL
    const provider = new ethers.JsonRpcProvider(rpcEntry.rpcUrl);

    // Create a wallet instance using the private key
    const senderWalletInstance = new ethers.Wallet(
      senderWallet.privateKey,
      provider
    );

    // Create an instance of the ERC-20 token contract
    const tokenContract = new ethers.Contract(
      tokenAddress,
      erc20Abi,
      senderWalletInstance
    );
    const tokenDecimals = await tokenContract.decimals();
    // Check the balance of the sender wallet for the specified token
    const balance = await tokenContract.balanceOf(fromAddress);
    const balanceInTokens = ethers.formatUnits(balance, tokenDecimals); // Adjust decimals as needed for your token

    // Check if the sender has enough balance
    if (parseFloat(balanceInTokens) < parseFloat(amount)) {
      throw new Error('Insufficient token balance in sender wallet.');
    }

    // Send the tokens
    const transactionResponse = await tokenContract.transfer(
      toAddress,
      ethers.utils.parseUnits(amount.toString(), 18)
    ); // Adjust decimals as needed for your token

    // Wait for the transaction to be mined
    await transactionResponse.wait();

    return {
      success: true,
      transactionHash: transactionResponse.hash,
      message: 'Token transfer successful.',
    };
  } catch (error) {
    console.error('Error sending tokens:', error);
    throw new Error(error.message || 'An error occurred while sending tokens.');
  }
};

const createWorkerWalletToken = async (req, res) => {
  const { ownerWallet, tokenAddress, number, userId } = req.body;
  if (!userId && !ownerWallet) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }

  const numberOfWallets = parseInt(number, 10);
  if (ownerWallet) {
    if (!ethers.isAddress(ownerWallet)) {
      return res.status(400).json({ error: 'Invalid owner wallet address' });
    }
  }

  if (!numberOfWallets || numberOfWallets <= 0) {
    return res
      .status(400)
      .json({ error: 'Invalid number of wallets specified' });
  }

  try {
    const createdWallets = [];
    for (let i = 0; i < numberOfWallets; i++) {
      const wallet = ethers.Wallet.createRandom();

      const workerWalletData = {
        tokenAddress,
        walletAddress: wallet.address,
        privateKey: wallet.privateKey,
        isFundingWallet: false,
        isWorkerWallet: true,
      };

      if (ownerWallet) {
        workerWalletData.ownerWallet = ownerWallet;
      } else {
        workerWalletData.userId = userId;
      }

      const workerWallet = new WorkerWallet(workerWalletData);
      await workerWallet.save();

      createdWallets.push({
        walletAddress: wallet.address,
        privateKey: wallet.privateKey,
      });
    }

    return res.status(201).json({
      message: `${number} wallets created successfully`,
      createdWallets,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const editWorkerWalletToken = async (req, res) => {
  const { oldTokenAddress, newTokenAddress, ownerWallet, userId } = req.body;
  if (!userId && !oldTokenAddress) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }

  try {
    const query = { tokenAddress: oldTokenAddress };

    if (userId) {
      query.userId = userId;
    } else if (ownerWallet) {
      query.ownerWallet = ownerWallet;
    } else {
      return res
        .status(400)
        .json({ error: 'Either userId or ownerWallet is required' });
    }

    const wallet = await WorkerWallet.findOneAndUpdate(
      query,
      { tokenAddress: newTokenAddress },
      { new: true }
    );

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    return res.status(200).json({
      message: 'Wallet updated successfully',
      wallet,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const deleteWorkerWalletToken = async (req, res) => {
  const { publicKey, tokenAddress, ownerWallet, userId } = req.body;
  if (!userId && !ownerWallet) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }

  try {
    const query = { walletAddress: publicKey, tokenAddress };

    if (userId) {
      query.userId = userId;
    } else if (ownerWallet) {
      query.ownerWallet = ownerWallet;
    } else {
      return res
        .status(400)
        .json({ error: 'Either userId or ownerWallet is required' });
    }

    const wallet = await WorkerWallet.findOneAndDelete(query);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    return res.status(200).json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const deleteWorkerWallet= async (req, res) => {
  const { walletAddress, ownerWallet, userId } = req.body;
  if (!userId && !ownerWallet) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }

  try {
    const query = { walletAddress };

    if (userId) {
      query.userId = userId;
    } else if (ownerWallet) {
      query.ownerWallet = ownerWallet;
    } else {
      return res
        .status(400)
        .json({ error: 'Either userId or ownerWallet is required' });
    }

    const wallet = await WorkerWallet.findOneAndDelete(query);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    return res.status(200).json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const listWorkerWalletsByToken = async (req, res) => {
  const { ownerWallet, tokenAddress,userId } = req.body;
  if (!userId && !ownerWallet) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }

  try {
    // Find all worker wallets associated with the owner wallet address
    const search = userId? {userId:userId} : {ownerWallet:ownerWallet}

    const workerWallets = await WorkerWallet.find({
      ...search,
      tokenAddress: tokenAddress,
    });

    if (!workerWallets || workerWallets.length === 0) {
      return res.status(404).json({ error: 'No wallets found for this owner' });
    }

    // Return the wallet address, isFundingWallet, and isWorkerWallet fields
    const walletDetails = workerWallets.map((wallet) => ({
      walletAddress: wallet.walletAddress,
      isFundingWallet: wallet.isFundingWallet,
      isWorkerWallet: wallet.isWorkerWallet,
    }));

    console.log(walletDetails);

    return res.status(200).json({ walletDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getDevWalletByToken = async (req, res) => {
  const { ownerWallet, tokenAddress,userId } = req.body;
  if (!userId && !ownerWallet) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }

  try {
    // Find all worker wallets associated with the owner wallet address
    const search = userId? {userId:userId} : {ownerWallet:ownerWallet}

    const devWallet = await Token.findOne({
      ...search,
      tokenAddress: tokenAddress,
    });

    if (!devWallet) {
      return res.status(404).json({ error: 'No wallets found for this owner' });
    }

    // Return the wallet address, isFundingWallet, and isWorkerWallet fields
    const walletDetails = {
      walletAddress: devWallet.publicKey,
    };


    return res.status(200).json({ walletDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const sendMultiToken = async (req, res) => {
  const { ownerWalletAddress, rpcUrl, tokenAddress, fromAddress, to,userId } =
    req.body;

  try {
    if (
      !ethers.isAddress(ownerWalletAddress) &&
      !userId ||
      !ethers.isAddress(fromAddress) ||
      !ethers.isAddress(tokenAddress) ||
      !Array.isArray(to) ||
      to.some(
        ({ toAddress, amount }) => !ethers.isAddress(toAddress) || amount <= 0
      )
    ) {
      throw new Error('Invalid input parameters.');
    }    
    const query = userId? {user:userId} : {walletAddress:ownerWalletAddress}


    const rpcEntry = await RPCUrl.findOne({
      rpcUrl: rpcUrl,
      ...query
    });
    if (!rpcEntry) {
      throw new Error('RPC URL not found.');
    }
    const search = userId? {userId:userId} : {ownerWallet:ownerWalletAddress}


    const senderWallet = await WorkerWallet.findOne({
      walletAddress: fromAddress,
      ...search
    });
    if (!senderWallet) {
      throw new Error('Sender wallet not found for this owner.');
    }

    const results = [];

    for (const recipient of to) {
      const { toAddress, amount } = recipient;
      try {
        const result = await sendToken(
          ownerWalletAddress,
          rpcUrl,
          tokenAddress,
          fromAddress,
          toAddress,
          amount
        );
        const isSuccess = result && result.hash ? true : false;
        const newEthTransferdata = {
          from:fromAddress,
          to:toAddress,
          amount,
          isSuccess:isSuccess,
          signature:transactionResponse.hash
        }
        if(ownerWalletAddress){
          newEthTransferdata.ownerWallet = ownerWalletAddress
        }else{
          newEthTransferdata.user = userId;
        }
        const newEthTransfer = new Ethtransfer(newEthTransferdata)
        await newEthTransfer.save()
        results.push({
          toAddress,
          amount,
          status: 'success',
          transactionHash: result.transactionHash,
        });
      } catch (error) {
        results.push({
          toAddress,
          amount,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return res.status(200).json({ success: true, results });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
const multiSend = async (req, res) => {
  const { ownerWalletAddress, rpcUrl, fromAddress, to ,userId} = req.body;
  if (!userId && !ownerWalletAddress) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }


  // Validate input parameters
  if (
    !ethers.isAddress(ownerWalletAddress) &&
    !userId ||
    !ethers.isAddress(fromAddress) ||
    !Array.isArray(to) || 
    to.length === 0
  ) {
    return res.status(400).json({ error: 'Invalid input parameters.' });
  }

  try {
    const query = userId? {user:userId} : {walletAddress:ownerWalletAddress}

   
    const rpcEntry = await RPCUrl.findOne({
      rpcUrl: rpcUrl,
      ...query
    });
    if (!rpcEntry) {
      return res.status(404).json({ error: 'RPC URL not found.' });
    }

    const search = userId? {userId:userId} : {ownerWallet:ownerWalletAddress}

    const senderWallet = await WorkerWallet.findOne({
      walletAddress: fromAddress,
     ...search
    });
    if (!senderWallet) {
      return res.status(404).json({ error: 'Sender wallet not found for this owner.' });
    }

    
    const provider = new ethers.JsonRpcProvider(rpcEntry.rpcUrl);

    
    const senderWalletInstance = new ethers.Wallet(senderWallet.privateKey, provider);

    
    const balance = await provider.getBalance(fromAddress);
    const balanceInEther = ethers.formatEther(balance);

    console.log(balance);
    
    let totalAmount = 0;
    for (const recipient of to) {
      const { toAddress, amount } = recipient;

      if (!ethers.isAddress(toAddress) || Number(amount) <= 0) {
        return res.status(400).json({ error: 'Invalid recipient address or amount.' });
      }

      totalAmount += Number(amount);
    }

    console.log("totalAmount",totalAmount);
    
    if (balanceInEther<totalAmount) {
      return res.status(400).json({ error: 'Insufficient balance in sender wallet.' });
    }

  
    const transactionResponses = [];
    for (const recipient of to) {
      const { toAddress, amount } = recipient;

      
      const transactionResponse = await send(ownerWalletAddress,rpcUrl,fromAddress, toAddress, amount);
      const isSuccess = transactionResponse && transactionResponse.hash ? true : false;
      const newEthTransferdata = {
        from:fromAddress,
        to:toAddress,
        amount,
        isSuccess:isSuccess,
        signature:transactionResponse.hash
      }
      if(ownerWalletAddress){
        newEthTransferdata.ownerWallet = ownerWalletAddress
      }else{
        newEthTransferdata.user = userId;
      }
      const newEthTransfer = new Ethtransfer(newEthTransferdata)
      await newEthTransfer.save()
      transactionResponses.push(transactionResponse);
    }

    return res.status(200).json({
      success: true,
      transactionResponses,
    });
  } catch (error) {
    console.error('Error sending ETH:', error);
    return res.status(500).json({ error: error.message || 'An error occurred while sending ETH.' });
  }
  
};


const downloadWorkerWalletsByToken = async (req, res) => {
  const { ownerWallet, tokenAddress,userId } = req.body;
  if (!userId && !ownerWallet) {
    return res
      .status(400)
      .json({ error: 'Either User ID or Wallet Address Required' });
  }

  try {
    // Find all worker wallets associated with the owner wallet address
    const search = userId? {userId:userId} : {ownerWallet:ownerWallet}

    const workerWallets = await WorkerWallet.find({
      ...search,
      tokenAddress: tokenAddress,
    });

    if (!workerWallets || workerWallets.length === 0) {
      return res.status(404).json({ error: 'No wallets found for this owner' });
    }



    const walletDetails = workerWallets.map((wallet) => ({
      walletAddress: wallet.walletAddress,
      privateKey: wallet.privateKey,
    }));

    const fields = ['walletAddress', 'privateKey'];
    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(walletDetails);

    res.header('Content-Type', 'text/csv');
    res.header(
      'Content-Disposition',
      'attachment; filename=wallet_details.csv'
    );

    return res.status(200).send(csvData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  send,
  sendToken,
  createWorkerWallet,
  listWorkerWallets,
  listWallets,
  setWalletType,
  getBalance,
  getAllBalances,
  getAllCoinBalances,
  getNewBalance,
  downloadListWallets,
  createWorkerWalletToken,
  editWorkerWalletToken,
  deleteWorkerWalletToken,
  listWorkerWalletsByToken,
  sendMultiToken,
  multiSend,
  downloadWorkerWalletsByToken,
  deleteWorkerWallet,
  getDevWalletByToken
};
