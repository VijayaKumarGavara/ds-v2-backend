const cloudinary = require("../config/cloudinary");
const path = require("path");

const Driver = require("../models/driver");
const Farmer = require("../models/farmer");
const { TractorWork } = require("../models/tractor_work");
const { TractorWorkPaymentDue } = require("../models/tractor_work_payment_due");
const {TractorTransaction} =require("../models/tractor_transaction");

const { generateId } = require("../utils/generateId");
const { getHashedPassword } = require("../utils/getHashedPassword");
const { comparePassword } = require("../utils/comparePassword");
const { generateToken } = require("../utils/jwt");
const getAgriYear = require("../utils/getAgriYear");

exports.registerDriver = async (req, res) => {
  try {
    const { driver_password, driver_mobile } = req.body;
    const existedDriver = await Driver.findDriverByMobile(driver_mobile);

    if (existedDriver) {
      return res.status(400).send({
        success: false,
        message: "Driver Already existed with this mobile number",
        error: "Mobile number already existed",
      });
    }

    const tempFile = req.file;
    const driver_id = generateId("Driver");
    const extension = path.extname(tempFile.originalname).toLowerCase();
    const fileName = `${driver_id}${extension}`;

    const cloudinaryRes = await cloudinary.uploader.upload(tempFile.path, {
      public_id: `${driver_id}`,
      folder: "drivers",
      overwrite: true,
      resource_type: "image",
    });
    const fs = require("fs");
    fs.unlinkSync(tempFile.path);

    const hashedPassword = await getHashedPassword(driver_password);
    const driverInfo = {
      ...req.body,
      driver_id,
      driver_password: hashedPassword,
      driver_image_path: fileName,
    };
    const result = await Driver.registerDriver(driverInfo);
    const safeDriver = {
      driver_id: result.driver_id,
      driver_name: result.driver_name,
      driver_village: result.driver_village,
      driver_mobile: result.driver_mobile,
      driver_image_path: result.driver_image_path,
    };
    const token = generateToken({
      user_id: safeDriver.driver_id,
      role: "driver",
    });

    res.status(200).send({
      success: true,
      data: safeDriver,
      token,
      role: "driver",
      message: "Driver Registered Successfully.",
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while registering the driver.",
      error: error.message,
    });
  }
};

exports.loginDriver = async (req, res) => {
  const { driver_mobile, driver_password } = req.body;
  try {
    const driverResults = await Driver.findDriverByMobile(driver_mobile);
    if (!driverResults) {
      return res.status(401).send({
        success: false,
        message:
          "Invalid login credentials. Please check your mobile number and password",
      });
    }
    const isMatch = await comparePassword(
      driver_password,
      driverResults?.driver_password,
    );
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message:
          "Invalid login credentials. Please check your mobile number and password",
      });
    }
    const { driver_id, driver_name, driver_village, driver_image_path } =
      driverResults;
    const token = generateToken({
      user_id: driver_id,
      role: "driver",
    });
    return res.status(200).send({
      success: true,
      message: "Logged in Successfully.",
      data: {
        driver_id,
        driver_name,
        driver_mobile: driverResults[0]?.driver_mobile,
        driver_village,
        driver_image_path,
      },
      token,
      role: "driver",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Something went wrong while logging in.",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  const data = req.body;
  const driver_id = req.user.user_id;
  try {
    const result = await Driver.updateProfile(driver_id, data);
    res
      .status(200)
      .send({ data: result, message: "Driver Data Updated Successfully." });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while updating the farmer.",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  const driver_id = req.user.user_id;
  try {
    const data = await Driver.getProfile(driver_id);
    res
      .status(200)
      .send({ data: data, message: "Drivers Data fetched successfully." });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while fetching the farmers.",
      error: error.message,
    });
  }
};

exports.findFarmers = async (req, res) => {
  const { farmer_name, farmer_village, farmer_mobile, farmer_id } = req.body;

  const filters = {
    farmer_name: farmer_name?.trim(),
    farmer_village: farmer_village?.trim(),
    farmer_mobile: farmer_mobile?.trim(),
    farmer_id: farmer_id?.trim(),
  };
  try {
    const farmerResults = await Farmer.findFarmers(filters);
    if (farmerResults.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No matching results found.",
        data: farmerResults,
      });
    } else {
      return res.status(200).send({
        success: true,
        data: farmerResults,
        message: "Successfully found the farmer.",
      });
    }
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: error.message,
      message: "Error while finding the famrers",
    });
  }
};

exports.getRecentFarmers = async (req, res) => {
  try {
    const driver_id = req.user.user_id;
    const recentFarmers = await TractorWork.aggregate([
      {
        $match: { driver_id },
      },

      {
        $sort: { createdAt: -1 },
      },

      {
        $group: {
          _id: "$farmer_id",
          lastPurchaseAt: { $first: "$createdAt" },
        },
      },

      {
        $lookup: {
          from: "farmers",
          localField: "_id",
          foreignField: "farmer_id",
          as: "farmer",
        },
      },

      { $unwind: "$farmer" },

      {
        $project: {
          _id: 0,
          farmer_id: "$farmer.farmer_id",
          farmer_name: "$farmer.farmer_name",
          farmer_mobile: "$farmer.farmer_mobile",
          farmer_village: "$farmer.farmer_village",
          farmer_image_path: "$farmer.farmer_image_path",
          work_date: 1,
        },
      },

      {
        $sort: { work_date: -1 },
      },
    ]);

    return res.status(200).send({
      success: true,
      data: recentFarmers,
      message: "Successfully fetched recent farmers",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to fetch recent farmers",
    });
  }
};

exports.getTractorWorks = async (req, res) => {
  const driver_id = req.user.user_id;
  const agri_year=req.query.agri_year;
  try {
    const tractorWorks = await TractorWork.aggregate([
      {
        $match: {
          driver_id,
          status: "active",
          agri_year
        },
      },

      {
        $lookup: {
          from: "farmers",
          localField: "farmer_id",
          foreignField: "farmer_id",
          as: "farmer",
        },
      },

      { $unwind: "$farmer" },

      {
        $project: {
          _id: 0,
          work_id: 1,
          quantity: { $round: ["$quantity", 2] },
          cost_per_unit: 1,
          total_amount: 1,
          createdAt: 1,
          work_date: 1,
          work: 1,
          notes: 1,
          farmer_name: "$farmer.farmer_name",
          farmer_village:"$farmer.farmer_name",
          farmer_mobile:"$farmer.farmer_mobile",
          farmer_image_path: "$farmer.farmer_image_path",
        },
      },

      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.status(200).send({
      success: true,
      data: tractorWorks,
      message: "Successfully fetched the tractor works.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to fetch the tractor works.",
    });
  }
};

exports.getPaymentDues = async (req, res) => {
  const driver_id = req.user.user_id;
  const matchStage = req.query;
  matchStage.driver_id = driver_id;
  try {
    const paymentDues = await TractorWorkPaymentDue.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "farmers",
          localField: "farmer_id",
          foreignField: "farmer_id",
          as: "farmer",
        },
      },
      {
        $unwind: "$farmer",
      },
      {
        $project: {
          due_id: 1,
          farmer_id: "$farmer.farmer_id",
          farmer_name: "$farmer.farmer_name",
          farmer_image_path: "$farmer.farmer_image_path",
          total_procurement_amount: 1,
          total_paid_amount: 1,
          balance_amount: 1,
        },
      },
    ]);
    return res.status(200). send({
      success: true,
      data: paymentDues,
      message: "Successfully fetched the payment dues.",
    })
  } catch (error) {
    return res.status(400).send({
      success: false,
      errror: error.message,
      message: "Failed to fetch the payment dues.",
    });
  }
};

exports.getTransactions = async (req, res) => {
  const driver_id = req.user.user_id;

  try {
    const driverTransactions = await TractorTransaction.aggregate([
      {
        $match: {
          driver_id,
        },
      },
      {
        $lookup: {
          from: "farmers",
          localField: "farmer_id",
          foreignField: "farmer_id",
          as: "farmer",
        },
      },
      { $unwind: "$farmer" },

      {
        $project: {
          _id: 0,
          transaction_id: 1,
          farmer_name: "$farmer.farmer_name",

          amount: 1,
          discount: { $ifNull: ["$discount", 0] },

          payment_mode: 1,
          remarks: 1,

          balance_before: 1,
          balance_after: 1,

          createdAt: 1,
        },
      },

      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).send({
      success: true,
      data: driverTransactions,
      message: "Driver Transactions fetched successfully.",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to fetch transactions.",
    });
  }
};