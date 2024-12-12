const { Schema, model } = require("mongoose");

const RouterSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    contract_address: {
      type: String,
      required: true,
    },
    networks: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Network",
          required: true,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const RouterModel = model("routers", RouterSchema);
module.exports = RouterModel;
