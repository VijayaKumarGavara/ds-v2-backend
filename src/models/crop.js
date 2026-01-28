const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    crop_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    crop_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // IMPORTANT
    },

    crop_units: {
      type: String,
      required: true,
      enum: ["kg", "quintal", "ton"], // adjust if needed
    },
  },
  {
    timestamps: true,
    strict: true, // 🔒 critical
  }
);

const Crop = mongoose.model("Crop", cropSchema);


exports.addCrop = async (data) => {
  const crop = new Crop(data);
  return crop.save();
};

exports.getCrops = async () => {
  return Crop.find(
    {},
    { crop_id: 1, crop_name: 1, crop_units: 1 }
  ).sort({ crop_name: 1 });
};

exports.updateCrop = async (crop_id, data) => {
  return Crop.findOneAndUpdate(
    { crop_id },
    data,
    { returnDocument: "after" }
  );
};

exports.getCropUnits = async ({ crop_name }) => {
  return Crop.findOne(
    { crop_name: crop_name.toLowerCase() },
    { crop_id: 1, crop_name: 1, crop_units: 1 }
  );
};

