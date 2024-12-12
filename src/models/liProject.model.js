const { Schema, model } = require("mongoose");

const liProjectSchema = new Schema(
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
          isEvm: {
            type: Boolean,
            required: true,
            default: false,
          },
          tokenAddress: {
            type: String,
            required: true,
          },
          tokenName: {
            type: String,
            required: true,
          },
          tokenSymbol: {
            type: String,
            required: true,
          },
          tokenImage: {
            type: String,
          },
          telegramUrl: {
            type: String,
          },
          twitterUrl: {
            type: String,
          },
          websiteUrl: {
            type: String,
          },
          tokenDesc: {
            type: String,
          },
          isMinted: {
            type: Boolean,
            default: false,
        },
          isDraft: {
            type: Boolean,
            default: false,
        }
        },
    { timestamps: true }
);

const Li_Project = model("Li_Project", liProjectSchema);

module.exports = Li_Project;
