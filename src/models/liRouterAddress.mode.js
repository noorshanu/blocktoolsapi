const { Schema, model } = require("mongoose");

const liRouterAddressSchema = new Schema(
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
        routerAddress: {
            type: String,
            required: true,
        },
     
    },
    { timestamps: true }
);

const Li_Routeraddress = model("Li_Routeraddress", liRouterAddressSchema);

module.exports = Li_Routeraddress;
