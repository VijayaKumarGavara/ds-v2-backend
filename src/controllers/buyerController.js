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
    const hashedPassword = await getHashedPassword(data.buyer_password);
    data.buyer_password = hashedPassword;
    data.buyer_id = generateId("B");
    const result = await Buyer.registerBuyer(data);
    const { buyer_name, buyer_id, buyer_mobile, buyer_village } = result;
    const token = generateToken({ buyer_id, buyer_mobile });
    res.status(200).send({
      success: true,
      message: "Buyer Registered Successfully.",
      data: { buyer_name, buyer_id, buyer_mobile, buyer_village },
      token,
      role: "buyer",
    });
  } catch (error) {
    res.status(400).send({
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
      res.status(401).send({
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
      res.status(401).send({
        success: false,
        message:
          "Invalid login credentials. Please check your mobile number and password",
      });
    }
    const { buyer_id, buyer_name, buyer_village } = buyerResults;
    const token = generateToken({
      user_id: buyer_id,
      role: "buyer",
    });
    res.status(200).send({
      success: true,
      message: "Logged in Successfully.",
      data: {
        buyer_id,
        buyer_name,
        buyer_mobile: buyerResults?.buyer_mobile,
        buyer_village,
      },
      token,
      role: "buyer",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong while logging in.",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  const buyer_id = req.user.user_id;
  try {
    const data = await Buyer.findBuyerById(buyer_id);
    res
      .status(200)
      .send({ data: data, message: "Buyers Data fetched successfully." });
  } catch (error) {
    res.status(400).send({
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
    res.status(201).send({
      data: result,
      success: true,
      message: "Buyer Data Updated Successfully.",
    });
  } catch (error) {
    res.status(400).send({
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
      res.status(200).send({
        success: true,
        message: "No matching results found.",
        data: farmerResults,
      });
    } else {
      res.status(200).send({
        success: true,
        data: farmerResults,
        message: "Successfully found the farmer.",
      });
    }
  } catch (error) {
    res.status(400).send({
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
          lastPurchaseAt: 1,
        },
      },

      {
        $sort: { lastPurchaseAt: -1 },
      },
    ]);

    res.status(200).send({
      success: true,
      data: recentFarmers,
      message: "Successfully fetched recent farmers",
    });
  } catch (error) {
    res.status(400).send({
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
          crop_name: "$crop.crop_name",
          crop_units: "$crop.crop_units",
        },
      },
      {
        $sort: { createdAt: -1 },
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
  console.log({ buyer_id });
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

    res.status(200).send({
      success: true,
      data: buyerTransactions,
      message: "Buyer Transactions fetched successfully.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to fetch the buyer transactions.",
    });
  }
};
