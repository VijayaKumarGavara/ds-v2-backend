const Buyer = require("../models/buyer");
const { ProcurementRequest } = require("../models/procurement_request");
const { Procurement } = require("../models/procurement");
const { PaymentDue } = require("../models/payment_dues");
const { Transaction } = require("../models/transaction");
const { comparePassword } = require("../utils/comparePassword");
const { getHashedPassword } = require("../utils/getHashedPassword");

exports.registerBuyer = async (req, res) => {
  try {
    const data = req.body;
    const hashedPassword = await getHashedPassword(data.buyer_password);
    data.buyer_password = hashedPassword;
    const result = await Buyer.registerBuyer(data);
    res.status(200).send({
      success: true,
      message: "Buyer Registered Successfully.",
      data: result,
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
    if (buyerResults.length === 0) {
      res.status(401).send({
        success: false,
        message:
          "Invalid login credentials. Please check your mobile number and password",
      });
    }
    const isMatch = await comparePassword(
      buyer_password,
      buyerResults[0]?.buyer_password
    );
    if (!isMatch) {
      res.status(401).send({
        success: false,
        message:
          "Invalid login credentials. Please check your mobile number and password",
      });
    }
    res.status(200).send({
      success: true,
      message: "Logged in Successfully.",
      data: buyerResults[0],
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong while logging in.",
      error: error.message,
    });
  }
};

exports.updateBuyer = async (req, res) => {
  const data = req.body;
  const { buyer_id } = req.body;
  console.log(req.body);
  try {
    const result = await Buyer.updateBuyer(buyer_id, data);
    console.log({ result });
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

exports.getProcurementRequests = async (req, res) => {
  const { buyer_id } = req.query;
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
  const { buyer_id } = req.query;
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
  const { buyer_id } = req.query;
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
  const { buyer_id } = req.query;
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
        },
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
