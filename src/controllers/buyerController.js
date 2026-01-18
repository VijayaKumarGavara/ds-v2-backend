const Buyer = require("../models/buyer");
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
