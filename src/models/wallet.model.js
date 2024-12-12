const { Schema, model } = require("mongoose");

const walletSchema = new Schema(
    {
        user: {
            type: String,
            },
          userId:{
            type: String,
          },
        networkVM: {
            type: String,
            required: true,
            lowercase: true,
            enum: ["ethereum", "bitcoin", "solana", "bitcoin-testnet"],
        },
        address: {
            type: String,
            required: true,
        },
        privateKey: {
            type: String,
            required: true,
        },
        mnemonic: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Wallet = model("Wallet", walletSchema);

module.exports = Wallet;
