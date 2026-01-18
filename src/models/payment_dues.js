const { Schema, model } = require("mongoose");

const paymentDueSchema = Schema(
  {
    due_id: { type: String },

    farmer_id: { type: String },
    buyer_id: { type: String },

    total_procurement_amount: { type: Number },
    total_paid_amount: { type: Number },
    balance_amount: { type: Number },
  },
  { timestamps: true }
);

const PaymentDue = model("PaymentDue", paymentDueSchema);

exports.createPaymentDue = async (data) => {
  try {
    const paymentDueInfo = new PaymentDue(data);
    const result = await paymentDueInfo.save();
    return result;
  } catch (error) {
    throw error;
  }
};

exports.updatePaymentDue = async (query, total_amount, session) => {
  try {
    return await PaymentDue.findOneAndUpdate(
      query,
      {
        $inc: {
          total_procurement_amount: total_amount,
          balance_amount: total_amount,
        },
        $setOnInsert: {
          total_paid_amount: 0,
        },
      },
      {
        new: true,
        upsert: true,
        session,
      }
    );
  } catch (error) {
    throw error;
  }
};

exports.findDue = async (farmer_id, buyer_id) => {
  try {
    const result = await PaymentDue.findOne({
      farmer_id: farmer_id,
      buyer_id,
      buyer_id,
    });
    return result;
  } catch (error) {
    throw error;
  }
};
