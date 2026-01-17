const mongoose = require("mongoose");

const buyerSchema = mongoose.Schema(
  {
    buyer_id: { type: String },
    buyer_name: { type: String },
    buyer_village: { type: String },
    buyer_mobile: { type: String },
    buyer_password: { type: String },
    status: { type: String },
  },
  { timestamps: true, strict: false }
);

const Buyer = mongoose.model("Buyer", buyerSchema);

exports.registerBuyer = async (buyerInfo) => {
  try {
    const buyer = new Buyer(buyerInfo);
    await buyer.save();
  } catch (error) {
    throw error;
  }
};

exports.findBuyerByMobile = async (buyer_mobile) => {
  try {
    const buyer = await Buyer.find({ buyer_mobile: buyer_mobile });
    return buyer;
  } catch (error) {
    throw error;
  }
};

exports.updateBuyer = async (buyer_id, data) => {
  try {
    const result = await Buyer.findOneAndUpdate({ buyer_id: buyer_id }, data, {
      returnDocument: "after",
    });
    return result;
  } catch (error) {
    throw error;
  }
};
