const cloudinary = require("../config/cloudinary");
const path = require("path");

const Buyer = require("../models/buyer");
const { ProcurementRequest } = require("../models/procurement_request");
const { Procurement } = require("../models/procurement");
const { PaymentDue } = require("../models/payment_dues");
const { Transaction } = require("../models/transaction");
const Farmer = require("../models/farmer");

const { comparePassword } = require("../utils/comparePassword");
const { getHashedPassword } = require("../utils/getHashedPassword");
const { generateId } = require("../utils/generateId");
const { generateToken } = require("../utils/jwt");
exports.registerBuyer = async (req, res) => {
  try {
    const data = req.body;
    const tempFile = req.file;

    const existedBuyer=await Buyer.findBuyerByMobile(data.buyer_mobile);
    if(existedBuyer){
      return res.status(400).send({
        success:false,
        message: "Buyer Already existed with this mobile number",
        error:"Mobile number already existed"
      });
    }
    
    const hashedPassword = await getHashedPassword(data.buyer_password);
    data.buyer_password = hashedPassword;
    data.buyer_id = generateId("B");

    const extension = path.extname(tempFile.originalname).toLowerCase();
    const fileName = `${data.buyer_id}${extension}`;

    const cloudinaryRes = await cloudinary.uploader.upload(tempFile.path, {
      public_id: `${data.buyer_id}`,
      folder: "buyers",
      overwrite: true,
      resource_type: "image",
    });
    const fs = require("fs");
    fs.unlinkSync(tempFile.path);

    data.buyer_image_path = fileName;

    const result = await Buyer.registerBuyer(data);
    const {
      buyer_name,
      buyer_id,
      buyer_mobile,
      buyer_village,
      buyer_image_path,
    } = result;
    const token = generateToken({
      user_id: buyer_id,
      role: "buyer",
    });
    return res.status(200).send({
      success: true,
      message: "Buyer Registered Successfully.",
      data: {
        buyer_name,
        buyer_id,
        buyer_mobile,
        buyer_village,
        buyer_image_path,
      },
      token,
      role: "buyer",
    });
  } catch (error) {
    return res.status(400).send({
      message: "Something went wrong while registering new buyer.",
      error: error.message,
    });
  }
};

exports.loginBuyer = async (req, res) => {
  const { buyer_mobile, buyer_password } = req.body;
  try {
    const buyerResults = await Buyer.findBuyerByMobile(buyer_mobile);
    if (!buyerResults) {
      return res.status(401).send({
        success: false,
        message:
          "Invalid login credentials. Please check your mobile number and password",
      });
    }
    const isMatch = await comparePassword(
      buyer_password,
      buyerResults?.buyer_password,
    );
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message:
          "Invalid login credentials. Please check your mobile number and password",
      });
    }
    const { buyer_id, buyer_name, buyer_village, buyer_image_path } = buyerResults;
    const token = generateToken({
      user_id: buyer_id,
      role: "buyer",
    });
    return res.status(200).send({
      success: true,
      message: "Logged in Successfully.",
      data: {
        buyer_id,
        buyer_name,
        buyer_mobile: buyerResults?.buyer_mobile,
        buyer_village,
        buyer_image_path
      },
      token,
      role: "buyer",
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
  const buyer_id = req.user.user_id;
  try {
    const data = await Buyer.getProfile(buyer_id);
    return res
      .status(200)
      .send({ data: data, message: "Buyers Data fetched successfully." });
  } catch (error) {
    return res.status(400).send({
      message: "Something went wrong while fetching the buyers.",
      error: error.message,
    });
  }
};

exports.updateBuyer = async (req, res) => {
  const data = req.body;
  const { buyer_id } = req.body;
  try {
    const result = await Buyer.updateBuyer(buyer_id, data);
    return res.status(201).send({
      data: result,
      success: true,
      message: "Buyer Data Updated Successfully.",
    });
  } catch (error) {
    return res.status(400).send({
      message: "Something went wrong while updating the buyer.",
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
    const buyer_id = req.user.user_id;

    const recentFarmers = await ProcurementRequest.aggregate([
      {
        $match: { buyer_id },
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
          lastPurchaseAt: 1,
        },
      },

      {
        $sort: { lastPurchaseAt: -1 },
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

exports.getProcurementRequests = async (req, res) => {
  const buyer_id = req.user.user_id;
  try {
    const pendingRequests = await ProcurementRequest.aggregate([
      {
        $match: {
          buyer_id: buyer_id,
          status: "pending",
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

          request_id: 1,
          status: 1,
          quantity: 1,
          createdAt: 1,

          farmer_name: "$farmer.farmer_name",
          farmer_image_path: "$farmer.farmer_image_path",
          crop_name: "$crop.crop_name",
          crop_units: "$crop.crop_units",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).send({
      success: true,
      data: pendingRequests,
      message: "Successfully fetched the procurement requests.",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      errror: error.message,
      message: "Failed to fetch the procurement requests.",
    });
  }
};

exports.getProcurements = async (req, res) => {
  const buyer_id = req.user.user_id;
  try {
    const finalizedProcurements = await Procurement.aggregate([
      {
        $match: {
          buyer_id: buyer_id,
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
          procurement_id: 1,
          request_id: 1,
          quantity: 1,
          createdAt: 1,
          farmer_name: "$farmer.farmer_name",
          farmer_image_path: "$farmer.farmer_image_path",
          crop_name: "$crop.crop_name",
          crop_units: "$crop.crop_units",
          cost_per_unit: 1,
          total_amount: 1,
        },
      },
    ]);

    res.status(200).send({
      success: true,
      data: finalizedProcurements,
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

exports.getPaymentDues = async (req, res) => {
  const buyer_id = req.user.user_id;
  try {
    const paymentDues = await PaymentDue.aggregate([
      // 1. Filter (WHERE)
      {
        $match: {
          buyer_id: buyer_id,
        },
      },

      // 2. JOIN farmers (optional, but you asked for name)
      {
        $lookup: {
          from: "farmers",
          localField: "farmer_id",
          foreignField: "farmer_id",
          as: "farmer",
        },
      },
      { $unwind: "$farmer" },

      // 3. SELECT (projection)
      {
        $project: {
          _id: 0,
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
    return res.status(200).send({
      success: true,
      data: paymentDues,
      message: "Successfully fetched the procurement.",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      errror: error.message,
      message: "Failed to fetch the finalized procurements.",
    });
  }
};

exports.getTransactions = async (req, res) => {
  const buyer_id = req.user.user_id;
  try {
    const buyerTransactions = await Transaction.aggregate([
      {
        $match: {
          buyer_id: buyer_id,
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
          _id: 1,
          farmer_name: "$farmer.farmer_name",
          amount: 1,
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
      data: buyerTransactions,
      message: "Buyer Transactions fetched successfully.",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to fetch the buyer transactions.",
    });
  }
};
