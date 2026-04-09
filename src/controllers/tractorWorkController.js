const mongoose = require("mongoose");

const TractorWork = require("../models/tractor_work");
const TractorWorkPaymentDue = require("../models/tractor_work_payment_due");
const { generateId } = require("../utils/generateId");
const getAgriYear = require("../utils/getAgriYear");

exports.createTractorWork = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const { quantity, cost_per_unit, farmer_id, driver_id } = req.body;

    const total_amount = Number(
      (Number(quantity) * Number(cost_per_unit)).toFixed(2)
    );

    const workInfo = {
      ...req.body,
      total_amount,
      work_id: generateId("WORK"),
      agri_year: getAgriYear(),
    };

    const tractorWorkResult = await TractorWork.createTractorWork(
      workInfo,
      session
    );

    let due_id;

    const existingDue = await TractorWorkPaymentDue.existingDue(
      farmer_id,
      driver_id,
      session
    );

    if (existingDue) {
      due_id = existingDue.due_id;
    } else {
      due_id = generateId("DUE");
    }

    const due = await TractorWorkPaymentDue.updatePaymentDue(
      { farmer_id, driver_id },
      total_amount,
      due_id,
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({
      success: true,
      data: [tractorWorkResult, due],
      message: "Work added successfully",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to add the tractor work.",
    });
  }
};

exports.updateTractorWork = async (req, res) => {};

exports.deleteTractorWork = async (req, res) => {};
