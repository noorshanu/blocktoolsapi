const { Schema, model } = require("mongoose");

const liRpcSchema = new Schema(
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
            required: true,
        },
        rpcUrl: {
            type: String,
            lowercase: true,
            required: true,
        },
    },
    { timestamps: true }
);

const Li_Rpc = model("Li_Rpc", liRpcSchema);

module.exports = Li_Rpc;
