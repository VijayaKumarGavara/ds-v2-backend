const Crop = require("../models/crop");

exports.addCrop = async (req, res) => {
  try {
    const result = await Crop.addCrop(req.body);
    res.status(200).send({
      success: true,
      message: "Crop added successfully.",
      data: result,
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong while adding new crop.",
      error: error,
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
      error: error,
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
      error: error,
    });
  }
};
