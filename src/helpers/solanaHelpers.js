const bip39 = require("bip39");
const solanaWeb3 = require("@solana/web3.js");
const { derivePath } = require("ed25519-hd-key");
const bs58 = require("bs58");
const solanaProvider = require("../utils/solanaProvider");


const solanaHelpers = {
  getConnection: async (rpcUrl) => {
    const connection = solanaProvider(rpcUrl);

    return connection;
  },

  createWallet: async (derivationPath) => {
    try {
      const path = derivationPath || "m/44'/501'/0'/0'";

      const mnemonic = bip39.generateMnemonic();
      const seed = await bip39.mnemonicToSeed(mnemonic);
      const derivedSeed = derivePath(path, seed).key;

      const keyPair = solanaWeb3.Keypair.fromSeed(derivedSeed);

      return {
        address: keyPair.publicKey.toBase58(),
        privateKey: bs58.encode(keyPair.secretKey),
        mnemonic,
      };
    } catch (err) {
      throw err;
    }
  },

  getBalance: async ({ rpcUrl, address }) => {
    try {
      const connection = await solanaHelpers.getConnection(rpcUrl);

      const publicKey = new solanaWeb3.PublicKey(address);
      balance = await connection.getBalance(publicKey);

      return balance / solanaWeb3.LAMPORTS_PER_SOL;
    } catch (err) {
      throw err;
    }
  },

  transfer: async ({ privateKey, rpcUrl, recipientAddress, amount }) => {
    try {
      const connection = await solanaHelpers.getConnection(rpcUrl);

      const recipient = new solanaWeb3.PublicKey(recipientAddress);
      let secretKey;
      let signature;

      if (privateKey.split(",").length > 1) {
        secretKey = new Uint8Array(privateKey.split(","));
      } else {
        secretKey = bs58.decode(privateKey);
      }

      const from = solanaWeb3.Keypair.fromSecretKey(secretKey, {
        skipValidation: true,
      });

      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: recipient,
          lamports: solanaWeb3.LAMPORTS_PER_SOL * amount,
        })
      );

      // Sign transaction, broadcast, and confirm
      signature = await solanaWeb3.sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
      );
      const response = await connection.getTransaction(signature);

      return {
        ...response,
      };
    } catch (err) {
      throw err;
    }
  },

  generateWalletFromMnemonic: async (mnemonic) => {
    try {
      const path = "m/44'/501'/0'/0'";
      const seed = await bip39.mnemonicToSeed(mnemonic);
      const derivedSeed = derivePath(path, seed).key;

      const keyPair = solanaWeb3.Keypair.fromSeed(derivedSeed);

      return {
        address: keyPair.publicKey.toBase58(),
        privateKey: bs58.encode(keyPair.secretKey),
        mnemonic,
      };
    } catch (err) {
      throw err;
    }
  },
};

module.exports = solanaHelpers;
