const Buyer = require("../models/buyer");
const Farmer = require("../models/farmer");

exports.getMe = async (req, res) => {
  try {
    const { user_id, role } = req.user;

    let user;
    if (role === "buyer") {
      user = await Buyer.findBuyerById(user_id);
    } else if (role === "farmer") {
      user = await Farmer.findFarmerById(user_id);
    } else {
      return res.status(400).send({
        success: false,
        message: "Invalid role in token",
      });
    }

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User does not exist",
      });
    }
    let safeUser;

    if (role === "buyer") {
      safeUser = {
        buyer_id: user.buyer_id,
        buyer_name: user.buyer_name,
        buyer_mobile: user.buyer_mobile,
        buyer_village: user.buyer_village,
      };
    }

    if (role === "farmer") {
      safeUser = {
        farmer_id: user.farmer_id,
        farmer_name: user.farmer_name,
        farmer_mobile: user.farmer_mobile,
        farmer_village: user.farmer_village,
      };
    }
    res.status(200).send({
      success: true,
      data: {
        role,
        user:safeUser,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};
