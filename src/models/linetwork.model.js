const { Schema, model } = require("mongoose");

const liNetworkSchema = new Schema(
    {
        user: {
            type: String,
            },
          userId:{
            type: String,
          },
        networkName: {
            type: String,
            required: true,
        },
        nativeCurrencyName: {
            type: String,
            required: true,
        },
        nativeCurrencySymbol: {
            type: String,
            required: true,
        },
        explorerUrl: {
            type: String,
            required: true,
        },
        chainId: {
            type: Number,
            required: true,
        },
        networkLogo: {
            type: String,
          },
        isEvm: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Li_Network = model("Li_Network", liNetworkSchema);

module.exports = Li_Network;
