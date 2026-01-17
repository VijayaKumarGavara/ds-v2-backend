const mongoose = require("mongoose");

const cropSchema = mongoose.Schema(
  {
    crop_id: { type: String },
    crop_name: { type: String },
    crop_units: { type: String },
  },
  { timestamps: true, strict: false }
);
const Crop = mongoose.model("Crop", cropSchema);

exports.addCrop = async (data) => {
  try {
    const crop = new Crop(data);
    const result = await crop.save();
    return result;
  } catch (error) {
    throw error;
  }
};

exports.getCrops = async () => {
  try {
    const result = await Crop.find({});
    return result;
  } catch (error) {
    throw error;
  }
};

exports.updateCrop = async (crop_id, data) => {
  try {
    const updatedData = await Crop.findOneAndUpdate(
      { crop_id: crop_id },
      data,
      { returnDocument: "after" }
    );
    return updatedData;
  } catch (error) {
    throw error;
  }
};
