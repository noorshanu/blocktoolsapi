
const { sendErrorResponse } = require('../helpers');
const Li_Network = require('../models/linetwork.model');
const Li_Rpc = require('../models/liRpc.model');
const Li_Wallet = require('../models/liWallet.model');
const User = require('../models/User');
const BuySettings = require('../models/buySettings.model');
const SellSettings = require('../models/sellSettings.model');
const TimeInterval = require('../models/timeInterval.model');
const Wallet = require('../models/wallet.model');
const WalletSettings = require('../models/walletSettings.model');

module.exports = {
    createWalletSettings: async (req, res) => {
        try {
            const {
                walletAddress,
                publicKey,
                buySettingsId,
                sellSettingsId,
                intervalId,
                networkId,
                rpcUrls,
            } = req.body;
            const user = await User.findOne({ walletAddress });
            if (!user) {
              return res.status(400).json({ error: 'Wallet not registered' });
            }
    
            const walletAddressExist = await Wallet.findOne({ address: walletAddress });
            if (!walletAddressExist) {
                return sendErrorResponse(res, 400, 'Invalid wallet address');
            }
    
            const buySettings = await BuySettings.findById(buySettingsId);
            if (!buySettings) {
                return sendErrorResponse(res, 400, 'Invalid Buy Settings ID');
            }
    
            const sellSettings = await SellSettings.findById(sellSettingsId);
            if (!sellSettings) {
                return sendErrorResponse(res, 400, 'Invalid Sell Settings ID');
            }
    
            const timeInterval = await TimeInterval.findById(intervalId);
            if (!timeInterval) {
                return sendErrorResponse(res, 400, 'Invalid Interval ID');
            }
    
            const chainId = await Li_Network.find(
                { networkId },
                { _id: 0, chainId: 1 }
            ).lean();
    
            const numericChainId = parseInt(chainId[0].chainId); 
            const newWalletSettings = new WalletSettings({
                user: walletAddress,
                walletAddress,
                publicKey,
                buySettingsId,
                sellSettingsId,
                intervalId,
                networkId,
                rpcUrls,
                chainId :numericChainId
            });
    
            await newWalletSettings.save();
    
            res.status(201).json({ message: 'Wallet settings created successfully' });
        } catch (err) {
            sendErrorResponse(res, 500, err.message);
        }
    },
    
    listWalletSettings: async (req, res) => {
        try {
            const { walletAddress } = req.body;
            const user = await User.findOne({ walletAddress });
            if (!user) {
              return res.status(400).json({ error: 'Wallet not registered' });
            }
    
            const walletAddressExist = await Wallet.findOne({ address: walletAddress });
            if (!walletAddressExist) {
                return sendErrorResponse(res, 400, 'Invalid wallet address');
            }
    
            const walletSettings = await WalletSettings.findOne({ walletAddress })
                .populate('buySettingsId')
                .populate('sellSettingsId')
                .populate('intervalId')
                .lean();
    
            if (!walletSettings) {
                return sendErrorResponse(res, 404, 'Wallet settings not found for the provided address');
            }
    
            const rpcUrl = await Li_Rpc.findOne({ networkId: walletSettings.networkId })
                .select({ _id: 0, rpcUrl: 1 })
                .lean();
    
            const networkName = await Li_Network.findOne({ networkId: walletSettings.networkId })
                .select({ _id: 0, networkName: 1 })
                .lean();
    
            const walletDetails = await Li_Wallet.findOne({ publicKey: walletSettings.publicKey });
            
            const result = {
                wallet: {
                    _id: walletSettings._id,
                    walletAddress: walletSettings.walletAddress,
                    publicKey: walletSettings.publicKey,
                    buySettingsId: walletSettings.buySettingsId._id,
                    sellSettingsId: walletSettings.sellSettingsId._id,
                    intervalId: walletSettings.intervalId._id,
                    isWorker: walletDetails.isWorker,
                    isActive: walletDetails.isActive,
                },
                buySettings: {
                    _id: walletSettings.buySettingsId._id,
                    settingsName: walletSettings.buySettingsId.settingsName,
                    minBuy: walletSettings.buySettingsId.minBuy,
                    maxBuy: walletSettings.buySettingsId.maxBuy,
                    buyPercentage: walletSettings.buySettingsId.buyPercentage,
                    isActive: walletSettings.buySettingsId.isActive,
                },
                sellSettings: {
                    _id: walletSettings.sellSettingsId._id,
                    settingsName: walletSettings.sellSettingsId.settingsName,
                    minSell: walletSettings.sellSettingsId.minSell,
                    maxSell: walletSettings.sellSettingsId.maxSell,
                    sellPercentage: walletSettings.sellSettingsId.sellPercentage,
                    isActive: walletSettings.sellSettingsId.isActive,
                },
                interval: {
                    _id: walletSettings.intervalId._id,
                    intervalType: walletSettings.intervalId.intervalType,
                    settingsID: walletSettings.intervalId.settingsID,
                    interval: walletSettings.intervalId.interval,
                },
                network: {
                    networkID: walletSettings.networkId,
                   networkName:  networkName.networkName,
                   rpcUrls: [rpcUrl],
                }, 
                chainId: walletSettings.chainId,
            };
    
            res.status(200).json(result);
        } catch (err) {
            sendErrorResponse(res, 500, err.message);
        }
    } 
};
