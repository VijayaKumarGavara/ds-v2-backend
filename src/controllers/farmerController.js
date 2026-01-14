const Farmer = require("../models/farmer");

exports.registerFarmer = async (req, res) => {
  try {
    const result = await Farmer.registerFarmer(req.body);
    res
      .status(200)
      .send({ data: result, message: "Farmer Registered Successfully." });
  } catch (err) {
    res.status(400).send({
      message: "Something went wrong while registering the farmer.",
      error: err,
    });
  }
};

exports.getFarmers = async (req, res) => {
  try {
    const data = await Farmer.getFarmers();
    res
      .status(200)
      .send({ data: data, message: "Farmers Data fetched successfully." });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while fetching the farmers.",
      error: err,
    });
  }
};

exports.updateFarmer = async (req, res) => {
  const data = req.body;
  const { farmer_id } = req.body;
  try {
    const result = await Farmer.updateFarmer(farmer_id, data);
    res
      .status(201)
      .send({ data: result, message: "Farmer Data Updated Successfully." });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while updating the farmer.",
      error: err,
    });
  }
};
