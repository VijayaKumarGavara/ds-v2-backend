const Farmer = require("../models/farmer");
const { ProcurementRequest } = require("../models/procurement_request");
const { Procurement } = require("../models/procurement");
const { PaymentDue } = require("../models/payment_dues");
const { Transaction } = require("../models/transaction");
exports.registerFarmer = async (req, res) => {
  try {
    const result = await Farmer.registerFarmer(req.body);
    res
      .status(200)
      .send({ data: result, message: "Farmer Registered Successfully." });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while registering the farmer.",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  const { farmer_id } = req.body;
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
  const { farmer_id } = req.body;
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
  const { farmer_id } = req.query;
  try {
    const pendingRequests = await ProcurementRequest.aggregate([
      {
        $match: {
          farmer_id: farmer_id,
          status: "pending",
        },
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
  const { farmer_id } = req.query;
  try {
    const finalizedSales = await Procurement.aggregate([
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
  const { farmer_id } = req.query;
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
  const { farmer_id } = req.query;
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
      {$unwind:"$buyer"},
      {
        $project: {
          _id: 0,
          buyer_name: "$buyer.buyer_name",
          amount: 1,
          balance_before: 1,
          balance_after: 1,
          createdAt:1
        },
      },
    ]);
    res
      .status(200)
      .send({
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
