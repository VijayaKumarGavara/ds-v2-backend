const Crop = require("../models/crop");
const { generateId } = require("../utils/generateId");

exports.addCrop = async (req, res) => {
  try {
    const cropInfo = { ...req.body, crop_id: generateId("C") };

    const result = await Crop.addCrop(cropInfo);
    res.status(200).send({
      success: true,
      message: "Crop added successfully.",
      data: result,
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while adding new crop.",
      error: error.message,
    });
  }
};

exports.getCrops = async (req, res) => {
  try {
    const data = await Crop.getCrops();
    res.status(200).send({
      success: true,
      message: "Crops fetched successfully.",
      data: data,
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while fetching crops.",
      error: error.message,
    });
  }
};

exports.updateCrop = async (req, res) => {
  const { crop_id } = req.body;
  const data = req.body;
  try {
    const result = await Crop.updateCrop(crop_id, data);
    res.status(200).send({
      success: true,
      message: "Crop updated successfully.",
      data: result,
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while updating crop.",
      error: error.message,
    });
  }
};

exports.getCropUnits = async (req, res) => {
  const { crop_name } = req.query;
  try {
    const results = await Crop.getCropUnits({ crop_name: crop_name });
    if (results && results.length === 0) {
      res
        .status(200)
        .send({ success: false, message: "Invalid crop name to fetch units." });
    }
    res.status(200).send({
      success: true,
      data: results,
      message: "Successfully fetched the crop units.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to get the crop units.",
    });
  }
};

