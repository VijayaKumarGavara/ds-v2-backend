const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema(
  {
    buyer_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    buyer_name: {
      type: String,
      required: true,
      trim: true,
    },

    buyer_village: {
      type: String,
      required: true,
      trim: true,
    },

    buyer_mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    buyer_password: {
      type: String,
      required: true,
      select: false,
    },
    buyer_image_path: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const Buyer = mongoose.model("Buyer", buyerSchema);

exports.registerBuyer = async (buyerInfo) => {
  const buyer = new Buyer(buyerInfo);
  return buyer.save();
};

exports.findBuyerByMobile = async (buyer_mobile) => {
  return Buyer.findOne({ buyer_mobile }).select("+buyer_password");
};

exports.findBuyerById = async (buyer_id) => {
  return Buyer.findOne({ buyer_id });
};

exports.updateBuyer = async (buyer_id, data) => {
  return Buyer.findOneAndUpdate({ buyer_id }, data, {
    returnDocument: "after",
  });
};

exports.getProfile = async (buyer_id) => {
  try {
    const data = await Buyer.findOne({ buyer_id: buyer_id });
    return data;
  } catch (error) {
    throw error;
  }
};