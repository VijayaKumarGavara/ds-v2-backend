const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    driver_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    driver_name: {
      type: String,
      required: true,
      trim: true,
    },

    driver_village: {
      type: String,
      required: true,
      trim: true,
    },

    driver_mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    driver_password: {
      type: String,
      required: true,
      select: false,
    },

    driver_image_path: {
      type: String,
      default: null,
    },

    driver_qrcode_path: {
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

const Driver = mongoose.model("Driver", driverSchema);

exports.registerDriver = async (driverInfo) => {
  const driver = new Driver(driverInfo);
  try {
    const result = await driver.save();
    return result;
  } catch (error) {
    throw error;
  }
};

exports.findDriverById = async (driver_id) => {
  return Driver.findOne({ driver_id });
};

exports.findDriverByMobile = async (driver_mobile) => {
  return Driver.findOne({ driver_mobile }).select("+driver_password");
};

exports.getProfile = async (driver_id) => {
  try {
    const data = await Driver.findOne({ driver_id: driver_id });
    return data;
  } catch (error) {
    throw error;
  }
};

exports.updateProfile = async (driver_id, data) => {
  try {
    const result = await Driver.findOneAndUpdate(
      { driver_id: driver_id },
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
