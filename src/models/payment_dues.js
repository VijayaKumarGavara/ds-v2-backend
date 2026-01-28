const { Schema, model } = require("mongoose");

const paymentDueSchema = new Schema(
  {
    due_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    farmer_id: {
      type: String,
      required: true,
      index: true,
    },

    buyer_id: {
      type: String,
      required: true,
      index: true,
    },

    total_procurement_amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    total_paid_amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    balance_amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const PaymentDue = model("PaymentDue", paymentDueSchema);

exports.createPaymentDue = async (data) => {
  const paymentDueInfo = new PaymentDue(data);
  return paymentDueInfo.save();
};

exports.existingDue = async (farmer_id, buyer_id, session) => {
  return PaymentDue.findOne({
    farmer_id,
    buyer_id,
  }).session(session);
};


exports.updatePaymentDue = async (query, total_amount, due_id, session) => {
  return PaymentDue.findOneAndUpdate(
    query,
    {
      $inc: {
        total_procurement_amount: total_amount,
        balance_amount: total_amount,
      },
      $setOnInsert: {
        due_id,
        total_paid_amount: 0,
      },
    },
    {
      new: true,
      upsert: true,
      session,
    },
  );
};

exports.findDue = async (farmer_id, buyer_id, due_id, session) => {
  return PaymentDue.findOne({
    farmer_id,
    buyer_id,
    due_id,
  }).session(session);
};

exports.applyPayment = async (query, amount, session) => {
  return PaymentDue.findOneAndUpdate(
    query,
    {
      $inc: {
        total_paid_amount: amount,
        balance_amount: -amount,
      },
    },
    {
      new: true,
      session,
    },
  );
};

exports.PaymentDue = PaymentDue;
