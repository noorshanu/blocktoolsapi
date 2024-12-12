const { ethers } = require("ethers");
const erc20Abi = require("../abi/erc20.json");
const ethersProvider = require("../utils/ethersProvider");

const ethereumHelpers = {
  getContract: async ( {rpcUrl, contractAddress,  privateKey, abi} ) => {

    const providerInstance = ethersProvider(rpcUrl);

    let nonce;
    let contract;
    let signer;
    const contractAbi = abi || erc20Abi;

    if (privateKey && contractAddress) {
    
      
      signer = new ethers.Wallet(privateKey, providerInstance);
    //  nonce = providerInstance.getTransactionCount(signer.getAddress());
      contract = new ethers.Contract(contractAddress, contractAbi, signer);

    } else if (privateKey && !contractAddress) {
      signer = new ethers.Wallet(privateKey, providerInstance);
    //  nonce = providerInstance.getTransactionCount(signer.getAddress());
    } else if (contractAddress && !privateKey) {
      contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        providerInstance
      );
    }

    return {
      contract,
      signer,
      providerInstance,
    };
  },

  createWallet: async (derivationPath) => {
    try {
      const path = derivationPath || "m/44'/60'/0'/0/0";
      const wallet = ethers.Wallet.createRandom({
        path,
      });

      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
      };
    } catch (err) {
      throw err;
    }
  },

  getBalance: async ( {rpcUrl, address, tokenAddress}) => {
    try {
      let contractAdd;
      const { contract, providerInstance } = await ethereumHelpers.getContract({
        rpcUrl,
        contractAddress: tokenAddress,
      });

      
      if (tokenAddress && contract) {
        const decimals = await contract.decimals();

        const balance = await contract.balanceOf(address);

        return ethers.formatUnits(balance, decimals);
      }

      const balance = await providerInstance.getBalance(address);

      return ethers.formatEther(balance);
    } catch (err) {
      throw err;
    }
  },

  transfer: async ({ privateKey, tokenAddress, rpcUrl, ...args }) => {
    const { contract, providerInstance, gasPrice, nonce } =
      await ethereumHelpers.getContract({
        rpcUrl,
        privateKey,
        contractAddress: tokenAddress,
      });

    let wallet = new ethers.Wallet(privateKey, providerInstance);

    try {
      let tx;

      if (contract) {
        const decimals = await contract.decimals();
        const estimatedGas = await contract.estimateGas.transfer(
          args.recipientAddress,
          ethers.utils.parseUnits(args.amount.toString(), decimals)
        );

        tx = await contract.transfer(
          args.recipientAddress,
          ethers.utils.parseUnits(args.amount.toString(), decimals),
          {
            gasPrice: args.gasPrice
              ? ethers.utils.parseUnits(args.gasPrice.toString(), "gwei")
              : gasPrice,
            nonce: args.nonce || nonce,
            gasLimit: args.gasLimit || estimatedGas,
          }
        );
      } else {
        tx = await wallet.sendTransaction({
          to: args.recipientAddress,
          value: ethers.utils.parseEther(args.amount.toString()),
          gasPrice: args.gasPrice
            ? ethers.utils.parseUnits(args.gasPrice.toString(), "gwei")
            : gasPrice,
          nonce: args.nonce || nonce,
          data: args.data
            ? ethers.utils.hexlify(ethers.utils.toUtf8Bytes(args.data))
            : "0x",
        });
      }

      return {
        ...tx,
      };
    } catch (error) {
      throw error;
    }
  },

  generateWalletFromMnemonic: async (mnemonic) => {
    try {
      const path = "m/44'/60'/0'/0/0";
      const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);

      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
      };
    } catch (err) {
      throw err;
    }
  },

  getTokenInfo: async ({ tokenAddress, rpcUrl }) => {
    try {
      const { contract } = await ethereumHelpers.getContract({
        contractAddress: tokenAddress,
        rpcUrl,
      });

      if (contract) {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
          contract.totalSupply(),
        ]);

        const data = {
          name,
          symbol,
          decimals,
          address: contract.address,
          totalSupply: parseInt(
            ethers.utils.formatUnits(totalSupply, decimals)
          ),
        };
        return data;
      }
      return;
    } catch (err) {
      throw err;
    }
  },

  // not working
  getGasPrice: async ({ rpcUrl, tokenAddress, ...args }) => {
    try {
      const { contract, providerInstance, gasPrice, nonce } =
        await ethereumHelpers.getContract({
          rpcUrl,
          privateKey,
          contractAddress: tokenAddress,
        });

      let wallet = new ethers.Wallet(privateKey, providerInstance);

      let tx;

      if (contract) {
        const decimals = await contract.decimals();
        const estimatedGas = await contract.estimateGas.transfer(
          args.recipientAddress,
          ethers.utils.parseUnits(args.amount.toString(), decimals)
        );

        console.log(estimatedGas);
      }
    } catch (err) {
      throw err;
    }
  },
};

module.exports = ethereumHelpers;
