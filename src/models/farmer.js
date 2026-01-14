const mongoose = require("mongoose");

const farmerSchema = mongoose.Schema(
  {
    farmer_id: { type: String },
    farmer_name: { type: String },
    farmer_mobile: { type: String },
    farmer_village: { type: String },
    farmer_image_path: { type: String },
    farmer_qrcode_path: { type: String },
    status: { type: String },
  },
  { timestamps: true, strict: false }
);

const Farmer = mongoose.model("Farmer", farmerSchema);

exports.registerFarmer = async (farmerInfo) => {
  const farmer = new Farmer(farmerInfo);
  try {
    await farmer.save();
  } catch (error) {
    return error;
  }
};

exports.getFarmers = async () => {
  try {
    const data = await Farmer.find({});
    return data;
  } catch (error) {
    return error;
  }
};

exports.updateFarmer = async (farmer_id, data) => {
  try {
    const result = await Farmer.findOneAndUpdate(
      { farmer_id: farmer_id },
      data,
      {
        returnDocument: "after",
      }
    );
    return result;
  } catch (error) {
    return error;
  }
};
