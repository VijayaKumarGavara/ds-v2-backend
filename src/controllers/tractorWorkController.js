const mongoose = require("mongoose");

const TractorWork = require("../models/tractor_work");
const TractorWorkPaymentDue = require("../models/tractor_work_payment_due");
const { generateId } = require("../utils/generateId");
const getAgriYear = require("../utils/getAgriYear");

exports.createTractorWork = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    let { quantity, cost_per_unit, farmer_id, driver_id } = req.body;

    const total_amount = Math.round(quantity * Number(cost_per_unit));

    const workInfo = {
      ...req.body,
      total_amount,
      work_id: generateId("WORK"),
      agri_year: getAgriYear(),
    };

    const tractorWorkResult = await TractorWork.createTractorWork(
      workInfo,
      session,
    );

    let due_id;

    const existingDue = await TractorWorkPaymentDue.existingDue(
      farmer_id,
      driver_id,
      session,
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
      session,
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

exports.updateTractorWork = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const { work_id } = req.query;
    console.log(req.body, work_id);
    const { quantity, cost_per_unit, work, notes } = req.body;

    const existingWork = await TractorWork.existingWork(work_id, session);

    if (!existingWork) {
      throw new Error("Work not found");
    }

    const old_total = existingWork.total_amount;

    const new_total = Number(
      (Number(quantity) * Number(cost_per_unit)).toFixed(2),
    );

    const diff = Number((new_total - old_total).toFixed(2));

    const updatedWork = await TractorWork.updateTractorWork(
      { work_id },
      {
        quantity,
        cost_per_unit,
        total_amount: new_total,
        work,
        notes,
        is_modified: true,
      },
      { session },
    );

    await TractorWorkPaymentDue.adjustDueByDiff(
      {
        farmer_id: existingWork.farmer_id,
        driver_id: existingWork.driver_id,
      },
      diff,
      session,
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({
      success: true,
      data: updatedWork,
      message: "Work updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to update work",
    });
  }
};

exports.deleteTractorWork = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const { work_id } = req.query;

    const existingWork = await TractorWork.existingWork(work_id, session);

    if (!existingWork) {
      throw new Error("Work not found");
    }

    const { farmer_id, driver_id, total_amount } = existingWork;

    const due = await TractorWorkPaymentDue.existingDue(
      farmer_id,
      driver_id,
      session,
    );

    if (!due) {
      throw new Error("Due record not found");
    }

    const hasPayment = due.total_paid_amount > 0;

    await TractorWorkPaymentDue.adjustDueByDiff(
      { farmer_id, driver_id },
      -total_amount,
      session,
    );

    await TractorWork.deleteOrCancelWork(work_id, hasPayment, session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({
      success: true,
      message: hasPayment
        ? "Work cancelled successfully"
        : "Work deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to delete work",
    });
  }
};
