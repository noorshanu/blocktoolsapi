const { sendErrorResponse } = require('../helpers');
const Li_Project = require('../models/liProject.model');
const Pool = require('../models/pool');
const Token = require('../models/token');
const User = require('../models/User');
const WorkerWallet = require('../models/WorkerWallet');
const { addToPool } = require('../utils/addToPool');
const UniswapLiquidityProvider = require('../utils/addToPoolv2');

module.exports = {
  // Create a new project
  createProject: async (req, res) => {
    try {
      const {
        networkId,
        isEvm,
        tokenAddress,
        tokenName,
        tokenSymbol,
        telegramUrl,
        twitterUrl,
        websiteUrl,
        tokenDesc,
        isMinted,
        isDraft,
        walletAddress,
      } = req.body;

      let tokenImage;
      if (req.file?.path) {
        tokenImage = '/' + req.file.path.replace(/\\/g, '/');
      }

      const user = await User.findOne({ walletAddress });
      if (!user) {
        return res.status(400).json({ error: 'Wallet not registered' });
      }

      if (!networkId) {
        return sendErrorResponse(res, 400, 'Network Id is required');
      }
      if (!tokenAddress || !tokenName || !tokenSymbol) {
        return sendErrorResponse(
          res,
          400,
          'Token details (address, name, symbol) are required'
        );
      }

      const newProject = new Li_Project({
        user: walletAddress,
        networkId,
        isEvm,
        tokenAddress,
        tokenName,
        tokenSymbol,
        tokenImage,
        telegramUrl,
        twitterUrl,
        websiteUrl,
        tokenDesc,
        isMinted: isMinted ? isMinted : false,
        isDraft: isDraft ? isDraft : false,
      });

      await newProject.save();
      res.status(200).json(newProject);
    } catch (err) {
      sendErrorResponse(res, 500, err.message || 'Internal server error');
    }
  },

  // Edit an existing project
  editProject: async (req, res) => {
    try {
      const { id } = req.params;

      const {
        networkId,
        isEvm,
        tokenAddress,
        tokenName,
        tokenSymbol,
        telegramUrl,
        twitterUrl,
        websiteUrl,
        tokenDesc,
        isMinted,
        isDraft,
        walletAddress,
      } = req.body;

      const user = await User.findOne({ walletAddress });
      if (!user) {
        return res.status(400).json({ error: 'Wallet not registered' });
      }
      const project = await Li_Project.findById(id);
      if (!project) {
        return sendErrorResponse(res, 404, 'Project not found');
      }

      const updateFields = {};
      if (networkId !== undefined) updateFields.networkId = networkId;
      if (isEvm !== undefined) updateFields.isEvm = isEvm;
      if (tokenAddress !== undefined) updateFields.tokenAddress = tokenAddress;
      if (tokenName !== undefined) updateFields.tokenName = tokenName;
      if (tokenSymbol !== undefined) updateFields.tokenSymbol = tokenSymbol;

      let tokenImage = project.tokenImage;
      if (req.file?.path) {
        tokenImage = '/' + req.file.path.replace(/\\/g, '/');
      }
      updateFields.tokenImage = tokenImage;

      if (telegramUrl !== undefined) updateFields.telegramUrl = telegramUrl;
      if (twitterUrl !== undefined) updateFields.twitterUrl = twitterUrl;
      if (websiteUrl !== undefined) updateFields.websiteUrl = websiteUrl;
      if (tokenDesc !== undefined) updateFields.tokenDesc = tokenDesc;

      if (isMinted !== undefined) updateFields.isMinted = isMinted;
      if (isDraft !== undefined) updateFields.isDraft = isDraft;

      await Li_Project.findByIdAndUpdate(id, updateFields, { new: true });

      res.status(200).json({ message: 'Project updated successfully' });
    } catch (err) {
      sendErrorResponse(res, 500, err.message || 'Internal server error');
    }
  },

  // List all projects
  listProjects: async (req, res) => {
    try {
      const { walletAddress, userId } = req.body;
      const projects = await Li_Project.find(
        { walletAddress },
        {
          isEvm: 1,
          tokenAddress: 1,
          tokenName: 1,
          tokenSymbol: 1,
          tokenImage: 1,
          telegramUrl: 1,
          twitterUrl: 1,
          websiteUrl: 1,
          tokenDesc: 1,
          isMinted: 1,
          isDraft: 1,
          updatedAt: 1,
        }
      );
      res.status(200).json(projects);
    } catch (err) {
      sendErrorResponse(res, 500, err.message || 'Internal server error');
    }
  },

  // Delete a project
  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;
      const { walletAddress } = req.body;
      const user = await User.findOne({ walletAddress });
      if (!user) {
        return res.status(400).json({ error: 'Wallet not registered' });
      }

      const deletedProject = await Li_Project.findByIdAndDelete(id);

      if (!deletedProject) {
        return sendErrorResponse(res, 404, 'Project not found');
      }

      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (err) {
      sendErrorResponse(res, 500, err.message || 'Internal server error');
    }
  },
  addToPools: async (req, res) => {
    try {
      const {
        rpcUrl,
        ownerWallet,
        tokenAddress,
        walletAddress,
        poolCreatorAddress,
        wethAddress,
        wethAmount,
        tokenAmount,
        sendValue,
      } = req.body;
      if (
        !rpcUrl ||
        ! ownerWallet ||
        !tokenAddress || //token B
        !poolCreatorAddress || //router address
        !wethAddress || //token A
        !wethAmount || //amount A
        !sendValue ||
        !tokenAmount //amount B
      ) {
        return res.status(400).json({
          error: 'Missing required parameters',
        });
      }
      //find private key

      // let receipt = await addToPool(
      //   rpcUrl,
      //   tokenAddress,
      //   poolCreatorAddress,
      //   wethAddress,
      //   wethAmount,
      //   tokenAmount,
      //   sendValue
      // );
      const walletData = await WorkerWallet.findOne({ownerWallet, walletAddress });

      let privateKey;
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
      
      const liquidityProviderV2 = new UniswapLiquidityProvider(
        poolCreatorAddress,
        rpcUrl,
        privateKey
      );

      const result = await liquidityProviderV2.addLiquidityV2(
        wethAddress,
        tokenAddress,
        wethAmount,
        tokenAmount
      );
      console.log(result)

      res.json(result);
    } catch (err) {
      sendErrorResponse(res, 500, err.message || 'Internal server error');
    }
  },
  createToPool: async (req, res) => {
    try {
      const {
        tokenaddress1,
        privatekey,
        tokenAddress2,
        tokenAmount1,
        tokenAmount2,
        routerAddress,
        version,
        rpurl,
      } = req.body;
      if (
        !tokenaddress1 ||
        !privatekey ||
        !tokenAddress2 ||
        !tokenAmount1 ||
        !tokenAmount2 ||
        !routerAddress ||
        !version ||
        !rpurl
      ) {
        return res.status(400).json({
          error: 'Missing required parameters',
        });
      }
      let newPool = await Pool({
        tokenaddress1,
        privatekey,
        tokenAddress2,
        tokenAmount1,
        tokenAmount2,
        routerAddress,
        version,
        rpurl,
      });
      await newPool.save();
      res.status(200).json({ message: 'success' });
    } catch (err) {
      sendErrorResponse(res, 500, err.message || 'Internal server error');
    }
  },
};
