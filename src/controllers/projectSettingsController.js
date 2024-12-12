const WalletSettings = require('../models/walletSettings.model');
const Li_Network = require('../models/linetwork.model');
const Li_Project = require('../models/liProject.model');
const Li_Rpc = require('../models/liRpc.model');
const Li_Wallet = require('../models/liWallet.model');
const ProjectSettings = require('../models/projectSettings.model');
const User = require('../models/User');
const WorkerWallet = require('../models/WorkerWallet');
const axios = require('axios');
const ethers = require('ethers');
const Token = require('../models/token');
const approveTokenSpend = require('../utils/approveUtils');
const UniswapV2Router = require('../utils/snipeUtils');

async function findTokenAddressFromTopic(txHash, topicHash, rpcUrl) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const receipt = await provider.getTransactionReceipt(txHash);
  console.log('reciept', receipt);
  for (const log of receipt.logs) {
    if (log.topics[0] === topicHash) {
      console.log('Found matching log:');
      console.log(log);
      return log.address;
    }
  }
}

module.exports = {
  createProjectSettings: async (req, res) => {
    const { projectId, walletList, isActive, isLive, walletAddress } = req.body;
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(400).json({ error: 'Wallet not registered' });
    }

    try {
      const projectExists = await Li_Project.findById(projectId);
      if (!projectExists) {
        return res.status(404).json({ message: 'Project not found' });
      }

      for (const walletId of walletList) {
        const walletExists = await WalletSettings.findById(walletId);
        if (!walletExists) {
          return res
            .status(404)
            .json({ message: `Wallet with ID ${walletId} not found` });
        }
      }

      const newProjectSettings = new ProjectSettings({
        user: walletAddress,
        projectId,
        walletList,
        isActive,
        isLive,
      });

      await newProjectSettings.save();

      return res
        .status(201)
        .json({ message: 'Project settings created successfully' });
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Server error', details: error.message });
    }
  },

  addWalletIdsToProjectSettings: async (req, res) => {
    const { id } = req.params;
    const { walletList, walletAddress } = req.body;
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(400).json({ error: 'Wallet not registered' });
    }

    try {
      const projectSettings = await ProjectSettings.findById(id);
      if (!projectSettings) {
        return res.status(404).json({ message: 'Project settings not found' });
      }

      for (const walletId of walletList) {
        const walletExists = await WalletSettings.findById(walletId);
        if (!walletExists) {
          return res
            .status(404)
            .json({ message: `Wallet with ID ${walletId} not found` });
        }
      }

      const existingWalletIdsSet = new Set(
        projectSettings.walletList.map((id) => id.toString())
      );

      walletList.forEach((walletId) => {
        if (!existingWalletIdsSet.has(walletId)) {
          existingWalletIdsSet.add(walletId);
        }
      });

      projectSettings.walletList = Array.from(existingWalletIdsSet);

      await projectSettings.save();

      return res.status(200).json({ message: 'Wallets added successfully' });
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Server error', details: error.message });
    }
  },

  removeWalletIdsFromProjectSettings: async (req, res) => {
    const { id } = req.params;
    const { walletList, walletAddress } = req.body;
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(400).json({ error: 'Wallet not registered' });
    }

    try {
      const projectSettings = await ProjectSettings.findById(id);
      if (!projectSettings) {
        return res.status(404).json({ message: 'Project settings not found' });
      }

      const existingWalletIdsSet = new Set(
        projectSettings.walletList.map((id) => id.toString())
      );

      walletList.forEach((walletId) => {
        if (existingWalletIdsSet.has(walletId)) {
          existingWalletIdsSet.delete(walletId);
        }
      });

      projectSettings.walletList = Array.from(existingWalletIdsSet);

      await projectSettings.save();

      return res.status(200).json({ message: 'Wallets removed successfully' });
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Server error', details: error.message });
    }
  },
  deleteProjectSettings: async (req, res) => {
    const { id } = req.params;

    try {
      const projectSettings = await ProjectSettings.findById(id);

      if (!projectSettings) {
        return res.status(404).json({ message: 'Project settings not found' });
      }

      if (projectSettings.isDeleted) {
        return res
          .status(400)
          .json({ message: 'Project settings already deleted' });
      }

      projectSettings.isDeleted = true;
      await projectSettings.save();

      return res
        .status(200)
        .json({ message: 'Project settings marked as deleted' });
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Server error', details: error.message });
    }
  },

  getProjectSettingsWithWallets: async (req, res) => {
    const { projectSettingId, walletAddress } = req.body;
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(400).json({ error: 'Wallet not registered' });
    }

    try {
      const projectSettings = await ProjectSettings.findById(
        projectSettingId
      ).lean();
      if (!projectSettings) {
        return res.status(404).json({ message: 'Project settings not found' });
      }

      const walletIds = Array.isArray(projectSettings.walletList)
        ? projectSettings.walletList
        : [];
      const walletDetailsArray = [];

      const walletSettingsPromises = walletIds.map((walletId) =>
        WalletSettings.findById(walletId)
          .populate('buySettingsId')
          .populate('sellSettingsId')
          .populate('intervalId')
          .lean()
      );

      const walletSettingsList = await Promise.all(walletSettingsPromises);

      const rpcUrlPromises = walletSettingsList.map((walletSettings) =>
        Li_Rpc.findOne({ networkId: walletSettings?.networkId })
          .select({ _id: 0, rpcUrl: 1 })
          .lean()
      );

      const networkNamePromises = walletSettingsList.map((walletSettings) =>
        Li_Network.findOne({ networkId: walletSettings?.networkId })
          .select({ _id: 0, networkName: 1 })
          .lean()
      );

      const walletDetailsPromises = walletSettingsList.map((walletSettings) =>
        Li_Wallet.findOne({ publicKey: walletSettings?.publicKey }).lean()
      );

      const [rpcUrls, networkNames, walletDetailsList] = await Promise.all([
        Promise.all(rpcUrlPromises),
        Promise.all(networkNamePromises),
        Promise.all(walletDetailsPromises),
      ]);

      walletSettingsList.forEach((walletSettings, index) => {
        if (!walletSettings) return;

        const rpcUrl = rpcUrls[index];
        const networkName = networkNames[index];
        const walletDetails = walletDetailsList[index];

        const walletDetailsObj = {
          wallet: {
            _id: walletSettings._id,
            walletAddress: walletSettings.walletAddress,
            publicKey: walletSettings.publicKey,
            buySettingsId: walletSettings.buySettingsId?._id,
            sellSettingsId: walletSettings.sellSettingsId?._id,
            intervalId: walletSettings.intervalId?._id,
            isWorker: walletDetails?.isWorker,
            isActive: walletDetails?.isActive,
          },
          buySettings: walletSettings.buySettingsId
            ? {
                _id: walletSettings.buySettingsId._id,
                settingsName: walletSettings.buySettingsId.settingsName,
                minBuy: walletSettings.buySettingsId.minBuy,
                maxBuy: walletSettings.buySettingsId.maxBuy,
                buyPercentage: walletSettings.buySettingsId.buyPercentage,
                isActive: walletSettings.buySettingsId.isActive,
              }
            : null,
          sellSettings: walletSettings.sellSettingsId
            ? {
                _id: walletSettings.sellSettingsId._id,
                settingsName: walletSettings.sellSettingsId.settingsName,
                minSell: walletSettings.sellSettingsId.minSell,
                maxSell: walletSettings.sellSettingsId.maxSell,
                sellPercentage: walletSettings.sellSettingsId.sellPercentage,
                isActive: walletSettings.sellSettingsId.isActive,
              }
            : null,
          interval: walletSettings.intervalId
            ? {
                _id: walletSettings.intervalId._id,
                intervalType: walletSettings.intervalId.intervalType,
                settingsID: walletSettings.intervalId.settingsID,
                interval: walletSettings.intervalId.interval,
              }
            : null,
          network: {
            networkID: walletSettings.networkId,
            networkName: networkName?.networkName,
            rpcUrls: [rpcUrl],
          },
          chainId: walletSettings.chainId,
        };

        walletDetailsArray.push(walletDetailsObj);
      });

      const result = {
        projectSettings: {
          _id: projectSettings._id,
          projectId: projectSettings.projectId,
          walletIds: walletIds,
          isActive: projectSettings.isActive,
          isLive: projectSettings.isLive,
          isDeleted: projectSettings.isDeleted,
        },
        walletDetails: walletDetailsArray,
      };

      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Server error', details: error.message });
    }
  },

  createToken: async (req, res) => {
    try {
      const {
        ownerWallet,
        name,
        symbol,
        decimals,
        totalSupply,
        rpcUrl,
        publicKey,
      } = req.body;

      // Validate required fields
      if (
        !name ||
        !symbol ||
        !decimals ||
        !totalSupply ||
        !rpcUrl ||
        !publicKey
      ) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      console.log(publicKey);
      let data;

      if (!ownerWallet) {
        data = await WorkerWallet.findOne({ walletAddress: publicKey }).select(
          'privateKey ownerWallet'
        );
      } else {
        data = await WorkerWallet.findOne({ walletAddress: publicKey }).select(
          'privateKey userId'
        );
      }

      if (!data) {
        return res.status(404).json({ error: 'Public key not found' });
      }

      const privateKey = data.privateKey;
      const deployer = '0x39d66282B4eEf63FaeB996983F07b5511fcdcE99';
      const deployValue = '0.0025';

      const payload = {
        name,
        symbol,
        decimals,
        totalSupply,
        rpcUrl,
        privateKey,
        deployer,
        deployValue,
      };
      const url = 'https://minter.blocktools.ai/api/deploy-token';

      let deploymentHash = '';
      let success = false;
      let deploymentMessage = '';

      try {
        const response = await axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });

        success = response.data.success || false;
        deploymentHash = response.data.deploymentHash || '';
        deploymentMessage = response.data.message || 'Deployment failed';
      } catch (error) {
        console.error('Axios deployment error:', error);
        deploymentMessage =
          error.code === 'ECONNABORTED'
            ? 'Deployment failed due to timeout'
            : error.message || 'Deployment error';
      }

      // Prepare token data
      const tokenData = {
        name,
        symbol,
        decimals,
        totalSupply,
        publicKey,
        rpcUrl,
        deployer,
        deployValue,
        success,
        deploymentHash,
      };

      if (!ownerWallet) {
        tokenData.userId = data.userId;
      } else {
        tokenData.ownerWallet = ownerWallet;
      }

      // Save token data to MongoDB
      const newToken = new Token(tokenData);
      await newToken.save();

      // Return response based on success status
      if (success) {
        return res.status(200).json({
          message: 'Token deployed and saved successfully',
          deploymentHash,
        });
      } else {
        return res.status(500).json({
          error: 'Token deployment failed',
          message: deploymentMessage,
        });
      }
    } catch (error) {
      console.error('Final catch error:', error);
      return res.status(500).json({
        error: 'Token creation process failed',
        message: error.message,
      });
    }
  },

  getTokens: async (req, res) => {
    try {
      const { ownerWallet, userId } = req.body;

      if (!ownerWallet) {
        return res.status(400).json({
          error: 'Missing required parameter',
        });
      }

      let tokens;
      if (ownerWallet) {
        tokens = await Token.find({ ownerWallet });
      } else {
        tokens = await Token.find({ userId });
      }

      if (tokens.length === 0) {
        return res.status(404).json({
          message: 'No tokens found for this user',
        });
      }

      const topicHash =
        '0x56358b41df5fa59f5639228f0930994cbdde383c8a8fd74e06c04e1deebe3562';

      for (const token of tokens) {
        if (!token.tokenAddress && token.deploymentHash) {
          try {
            const tokenAddress = await findTokenAddressFromTopic(
              token.deploymentHash,
              topicHash,
              token.rpcUrl
            );

            token.tokenAddress = tokenAddress;
            await token.save();
          } catch (error) {
            console.error(
              `Error updating token address for token with deploymentHash ${token.deploymentHash}:`,
              error
            );
          }
        }
      }

      return res.status(200).json({ tokens });
    } catch (error) {
      console.error('Error retrieving tokens:', error);

      return res.status(500).json({
        error: 'Failed to retrieve tokens',
        message: error.message,
      });
    }
  },
  createTokenFromPrivateKey: async (req, res) => {
    try {
      const {
        ownerWallet,
        userId,
        name,
        symbol,
        decimals,
        totalSupply,
        rpcUrl,
        privateKey,
      } = req.body;

      // Validate required fields
      if (
        !name ||
        !symbol ||
        !decimals ||
        !totalSupply ||
        !rpcUrl ||
        !privateKey
      ) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Create a wallet instance with the provided private key
      const wallet = new ethers.Wallet(privateKey);
      const publicKey = wallet.address;

      // Define payload for token deployment
      const deployer = '0x39d66282B4eEf63FaeB996983F07b5511fcdcE99';
      const deployValue = '0.0025';
      const payload = {
        name,
        symbol,
        decimals,
        totalSupply,
        rpcUrl,
        privateKey,
        deployer,
        deployValue,
      };
      const url = 'https://minter.blocktools.ai/api/deploy-token';

      let deploymentHash = '';
      let deploymentMessage = 'Deployment failed';
      let success = false;

      try {
        const response = await axios.post(url, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        });

        success = response.data.success || false;
        deploymentHash = response.data.deploymentHash || '';
        deploymentMessage = response.data.message || deploymentMessage;
      } catch (error) {
        console.error('Axios deployment error:', error);
        deploymentMessage =
          error.code === 'ECONNABORTED'
            ? 'Deployment failed due to timeout'
            : error.message || 'Deployment error';
      }

      // Prepare token data for MongoDB
      const tokenData = {
        ownerWallet,
        name,
        symbol,
        decimals,
        totalSupply,
        publicKey,
        privateKey,
        rpcUrl,
        deployer,
        deployValue,
        success,
        deploymentHash,
      };

      if (!ownerWallet) {
        tokenData.userId = userId;
      } else {
        tokenData.ownerWallet = ownerWallet;
      }

      // Save token data to MongoDB
      const newToken = new Token(tokenData);
      await newToken.save();

      // Return response based on success status
      return success
        ? res.status(200).json({
            message: 'Token deployed and saved successfully',
            deploymentHash,
          })
        : res.status(500).json({
            error: 'Token deployment failed',
            message: deploymentMessage,
          });
    } catch (error) {
      console.error('Final catch error:', error);
      return res.status(500).json({
        error: 'Token creation process failed',
        message: error.message,
      });
    }
  },
  approveToken: async (req, res) => {
    const {
      ownerWallet,
      walletAddress,
      tokenAddress,
      spenderAddress,
      amountInEther,
      rpcUrl,
    } = req.body;

    try {
      let privateKey;
      const walletData = await WorkerWallet.findOne({ownerWallet, walletAddress });
      if (walletData && walletData.privateKey) {
        privateKey = walletData.privateKey;
      } else {
        const tokenData = await Token.findOne({ownerWallet, tokenAddress });
        if (tokenData && tokenData.privateKey) {
          privateKey = tokenData.privateKey;
        }
      }
  
      
      if (!privateKey) {
        return res.status(404).json({ error: "Private key not found" });
      }
      const result = await approveTokenSpend(
        rpcUrl,
        privateKey,
        tokenAddress,
        spenderAddress,
        amountInEther
      );

      if (result) {
        return res
          .status(200)
          .json({ isSuccess: true, hash: result.blockHash });
      } else {
        return res.status(200).json({ isSuccess: false });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  },

snipeToken: async (req, res) => {
  const { ownerWallet, tokenAddress, walletDetails, rpcUrl,routerAddress } = req.body;

  console.log(ownerWallet, tokenAddress, walletDetails, rpcUrl,routerAddress)

  try {
    const results = []; 
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    for (const walletDetail of walletDetails) {
      const { publicKey, snipeAmountInEther } = walletDetail;

      
      
        const balance = await provider.getBalance(publicKey);
        const balanceInEther = ethers.formatEther(balance);

        console.log(balanceInEther)

        if (parseFloat(balanceInEther) < parseFloat(snipeAmountInEther)) {
          results.push({
            publicKey,
            snipeAmountInEther,
            status: "Error",
            message: "Insufficient balance",
          });
          continue; 
        }

        
        const walletData = await WorkerWallet.findOne({ 
          ownerWallet, 
          walletAddress:publicKey 
        });

        if (!walletData) {
          results.push({
            publicKey,
            snipeAmountInEther,
            status: "Error",
            message: "Wallet Not Found",
          });
          continue; 
        }

       
        const { privateKey } = walletData;
        const UniswapV2RouterInstance = new UniswapV2Router(rpcUrl,privateKey,routerAddress)
        const result = UniswapV2RouterInstance.swapETHForExactTokens()
       
      }

    
    return res.status(200).json({ results });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

};
