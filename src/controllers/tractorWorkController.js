const TractorWork = require("../models/tractor_work");
const { generateId } = require("../utils/generateId");
const getAgriYear = require("../utils/getAgriYear");

exports.createTractorWork = async (req, res) => {

    const {quantity, cost_per_unit}=req.body;
    const total_amount = Number((Number(quantity) * Number(cost_per_unit)).toFixed(2));
    console.log({quantity, cost_per_unit,total_amount})
  try {
    const workInfo = {
      ...req.body,
      total_amount,
      work_id: generateId("WORK"),
      agri_year: getAgriYear(),
    };
    const result = await TractorWork.createTractorWork(workInfo);
    res.status(200).send({
      success: true,
      data: result,
      message: "Successfully created the tractor work.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to add the tractor work.",
    });
  }
};

exports.updateTractorWork = async (req, res) => {};

exports.deleteTractorWork = async (req, res) => {};
