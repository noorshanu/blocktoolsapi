const { Schema, model } = require("mongoose");

const liWalletSchema = new Schema(
    {
        user: {
            type: String,
            },
          userId:{
            type: String,
          },
        networkId: {
            type: Schema.Types.ObjectId,
            ref: "Li_Network",
          
        },
        privateKey: {
            type: String,
            required: true,
        },
        publicKey: {
            type: String,
            required: true,
        },
        isWorker: {
            type: String,
            default: false,
        },
        isActive: {
            type: String,
            default: false,
        }
     
    },
    { timestamps: true }
);

const Li_Wallet = model("Li_Wallet", liWalletSchema);

module.exports = Li_Wallet;
