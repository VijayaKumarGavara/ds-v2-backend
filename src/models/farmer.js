const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    farmer_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    farmer_name: {
      type: String,
      required: true,
      trim: true,
    },

    farmer_village: {
      type: String,
      required: true,
      trim: true,
    },

    farmer_mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    farmer_password: {
      type: String,
      required: true,
      select: false,
    },

    farmer_image_path: {
      type: String,
      default: null,
    },

    farmer_qrcode_path: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    registered_by: {
      type: String,
      enum: ["self", "buyer"],
      default: "self",
    },

    registered_by_buyer_id: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const Farmer = mongoose.model("Farmer", farmerSchema);

exports.registerFarmer = async (farmerInfo) => {
  const farmer = new Farmer(farmerInfo);
  try {
    const result = await farmer.save();
    return result;
  } catch (error) {
    throw error;
  }
};

exports.findFarmerById = async (farmer_id) => {
  return Farmer.findOne({ farmer_id });
};

exports.findFarmerByMobile = async (farmer_mobile) => {
  return Farmer.findOne({ farmer_mobile }).select("+farmer_password");
};

exports.getProfile = async (farmer_id) => {
  try {
    const data = await Farmer.findOne({ farmer_id: farmer_id });
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

    return await Farmer.find(
      { $or: orConditions },
      { farmer_id: 1, farmer_name: 1, farmer_mobile: 1, farmer_village: 1, farmer_image_path:1 },
    ).limit(20);
  } catch (error) {
    throw error;
  }
};
