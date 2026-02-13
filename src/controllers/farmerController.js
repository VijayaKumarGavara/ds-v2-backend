const cloudinary = require("../config/cloudinary");
const path = require("path");
const Farmer = require("../models/farmer");
const { ProcurementRequest } = require("../models/procurement_request");
const { Procurement } = require("../models/procurement");
const { PaymentDue } = require("../models/payment_dues");
const { Transaction } = require("../models/transaction");
const { generateId } = require("../utils/generateId");
const { getHashedPassword } = require("../utils/getHashedPassword");
const { comparePassword } = require("../utils/comparePassword");
const { generateToken } = require("../utils/jwt");
const getAgriYear = require("../utils/getAgriYear");

exports.registerFarmer = async (req, res) => {
  try {
    const { farmer_password, farmer_mobile } = req.body;
    const existedFarmer = await Farmer.findFarmerByMobile(farmer_mobile);

    if (existedFarmer) {
      return res.status(400).send({
        success: false,
        message: "Farmer Already existed with this mobile number",
        error: "Mobile number already existed",
      });
    }
    const tempFile = req.file;
    const farmer_id = generateId("F");
    const extension = path.extname(tempFile.originalname).toLowerCase();
    const fileName = `${farmer_id}${extension}`;

    const cloudinaryRes = await cloudinary.uploader.upload(tempFile.path, {
      public_id: `${farmer_id}`,
      folder: "farmers",
      overwrite: true,
      resource_type: "image",
    });
    const fs = require("fs");
    fs.unlinkSync(tempFile.path);

    const hashedPassword = await getHashedPassword(farmer_password);
    const farmerInfo = {
      ...req.body,
      farmer_id,
      farmer_password: hashedPassword,
      farmer_image_path: fileName,
    };
    const result = await Farmer.registerFarmer(farmerInfo);
    const safeFarmer = {
      farmer_id: result.farmer_id,
      farmer_name: result.farmer_name,
      farmer_village: result.farmer_village,
      farmer_mobile: result.farmer_mobile,
      farmer_image_path: result.farmer_image_path,
    };
    const token = generateToken({
      user_id: safeFarmer.farmer_id,
      role: "farmer",
    });

    res.status(200).send({
      success: true,
      data: safeFarmer,
      token,
      role: "farmer",
      message: "Farmer Registered Successfully.",
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while registering the farmer.",
      error: error.message,
    });
  }
};

exports.loginFarmer = async (req, res) => {
  const { farmer_mobile, farmer_password } = req.body;
  try {
    const farmerResults = await Farmer.findFarmerByMobile(farmer_mobile);
    if (!farmerResults) {
      return res.status(401).send({
        success: false,
        message:
          "Invalid login credentials. Please check your mobile number and password",
      });
    }
    const isMatch = await comparePassword(
      farmer_password,
      farmerResults?.farmer_password,
    );
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message:
          "Invalid login credentials. Please check your mobile number and password",
      });
    }
    const { farmer_id, farmer_name, farmer_village, farmer_image_path } =
      farmerResults;
    const token = generateToken({
      user_id: farmer_id,
      role: "farmer",
    });
    return res.status(200).send({
      success: true,
      message: "Logged in Successfully.",
      data: {
        farmer_id,
        farmer_name,
        farmer_mobile: farmerResults[0]?.farmer_mobile,
        farmer_village,
        farmer_image_path,
      },
      token,
      role: "farmer",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Something went wrong while logging in.",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  const farmer_id = req.user.user_id;
  try {
    const data = await Farmer.getProfile(farmer_id);
    res
      .status(200)
      .send({ data: data, message: "Farmers Data fetched successfully." });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while fetching the farmers.",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  const data = req.body;
  const farmer_id = req.user.user_id;
  try {
    const result = await Farmer.updateProfile(farmer_id, data);
    res
      .status(201)
      .send({ data: result, message: "Farmer Data Updated Successfully." });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while updating the farmer.",
      error: error.message,
    });
  }
};

//  Sales
exports.getSellingRecords = async (req, res) => {
  const farmer_id = req.user.user_id;
  const matchStage = {
    farmer_id: farmer_id,
    status: "pending",
  };

  

  try {
    const pendingRequests = await ProcurementRequest.aggregate([
      {
        $match: matchStage,
      },

      {
        $lookup: {
          from: "buyers",
          localField: "buyer_id",
          foreignField: "buyer_id",
          as: "buyer",
        },
      },
      { $unwind: "$buyer" },

      {
        $lookup: {
          from: "crops",
          localField: "crop_id",
          foreignField: "crop_id",
          as: "crop",
        },
      },
      { $unwind: "$crop" },

      {
        $project: {
          _id: 0,
          crop_id:"$crop.crop_id",
          buyer_name: "$buyer.buyer_name",
          crop_name: "$crop.crop_name",
          crop_units: "$crop.crop_units",
          quantity: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ]);

    res.status(200).send({
      success: true,
      data: pendingRequests,
      message: "Successfully fetched the procurement requests.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      errror: error.message,
      message: "Failed to fetch the procurement requests.",
    });
  }
};
exports.getFinalizedRecords = async (req, res) => {
  const farmer_id = req.user.user_id;
  const agri_year = req.query.agri_year;
  const matchStage = {
    farmer_id: farmer_id,
    status: "finalized",
  };

  
  if (agri_year) {
    matchStage.agri_year = agri_year;
  }

  try {
    const finalizedSales = await Procurement.aggregate([
      // 1. Filter (WHERE)
      {
        $match: matchStage,
      },

      // 2. JOIN buyers
      {
        $lookup: {
          from: "buyers",
          localField: "buyer_id",
          foreignField: "buyer_id",
          as: "buyer",
        },
      },
      { $unwind: "$buyer" },

      // 3. JOIN crops
      {
        $lookup: {
          from: "crops",
          localField: "crop_id",
          foreignField: "crop_id",
          as: "crop",
        },
      },
      { $unwind: "$crop" },

      // 4. JOIN farmers (optional, but you asked for name)
      {
        $lookup: {
          from: "farmers",
          localField: "farmer_id",
          foreignField: "farmer_id",
          as: "farmer",
        },
      },
      { $unwind: "$farmer" },

      // 5. SELECT (projection)
      {
        $project: {
          _id: 0,
          crop_id:"$crop.crop_id",
          farmer_name: "$farmer.farmer_name",
          buyer_name: "$buyer.buyer_name",
          crop_name: "$crop.crop_name",
          crop_units: "$crop.crop_units",
          quantity: 1,
          cost_per_unit: 1,
          total_amount: 1,
          finalizedAt: 1,
        },
      },
    ]);
    res.status(200).send({
      success: true,
      data: finalizedSales,
      message: "Successfully fetched the procurement.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      errror: error.message,
      message: "Failed to fetch the finalized procurements.",
    });
  }
};

//  Payments
exports.getPaymentDues = async (req, res) => {
  const farmer_id = req.user.user_id;
  try {
    const paymentDues = await PaymentDue.aggregate([
      // 1. Filter (WHERE)
      {
        $match: {
          farmer_id: farmer_id,
        },
      },

      // 2. JOIN buyers
      {
        $lookup: {
          from: "buyers",
          localField: "buyer_id",
          foreignField: "buyer_id",
          as: "buyer",
        },
      },
      { $unwind: "$buyer" },

      // 3. JOIN farmers (optional, but you asked for name)
      {
        $lookup: {
          from: "farmers",
          localField: "farmer_id",
          foreignField: "farmer_id",
          as: "farmer",
        },
      },
      { $unwind: "$farmer" },

      // 5. SELECT (projection)
      {
        $project: {
          _id: 0,
          buyer_name: "$buyer.buyer_name",
          total_procurement_amount: 1,
          total_paid_amount: 1,
          balance_amount: 1,
        },
      },
    ]);
    res.status(200).send({
      success: true,
      data: paymentDues,
      message: "Successfully fetched the procurement.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      errror: error.message,
      message: "Failed to fetch the finalized procurements.",
    });
  }
};

exports.getTransactions = async (req, res) => {
  const farmer_id = req.user.user_id;
  try {
    const farmerTransactions = await Transaction.aggregate([
      {
        $match: { farmer_id: farmer_id },
      },
      {
        $lookup: {
          from: "buyers",
          localField: "buyer_id",
          foreignField: "buyer_id",
          as: "buyer",
        },
      },
      { $unwind: "$buyer" },
      {
        $project: {
          _id: 0,
          buyer_name: "$buyer.buyer_name",
          amount: 1,
          balance_before: 1,
          balance_after: 1,
          createdAt: 1,
        },
      },
    ]);
    res.status(200).send({
      success: true,
      data: farmerTransactions,
      message: "Farmer Transactions fetched successfully.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to fetch the transactions.",
    });
  }
};
