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
  { timestamps: true, strict: false },
);

const Farmer = mongoose.model("Farmer", farmerSchema);

exports.registerFarmer = async (farmerInfo) => {
  const farmer = new Farmer(farmerInfo);
  try {
    await farmer.save();
  } catch (error) {
    throw error;
  }
};

exports.getProfile = async (farmer_id) => {
  try {
    const data = await Farmer.find({ farmer_id: farmer_id });
    return data;
  } catch (error) {
    throw error;
  }
};

exports.updateProfile = async (farmer_id, data) => {
  try {
    const result = await Farmer.findOneAndUpdate(
      { farmer_id: farmer_id },
      data,
      {
        returnDocument: "after",
      },
    );
    return result;
  } catch (error) {
    throw error;
  }
};

exports.findFarmers = async (filters) => {
  try {
    const orConditions = [];

    if (filters.farmer_name && filters.farmer_village) {
      orConditions.push({
        $and: [
          {
            farmer_name: {
              $regex: filters.farmer_name,
              $options: "i",
            },
          },
          {
            farmer_village: {
              $regex: filters.farmer_village,
              $options: "i",
            },
          },
        ],
      });
    }

    if (filters.farmer_mobile) {
      orConditions.push({ farmer_mobile: filters.farmer_mobile });
    }

    if (filters.farmer_id) {
      orConditions.push({ farmer_id: filters.farmer_id });
    }

    if (orConditions.length === 0) {
      throw new Error("At least one valid search parameter is required");
    }

    return await Farmer.find({ $or: orConditions },{farmer_id:1, farmer_name:1, farmer_mobile:1, farmer_village:1});
  } catch (error) {
    throw error;
  }
};


