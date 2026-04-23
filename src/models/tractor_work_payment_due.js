const { Schema, model } = require("mongoose");

const tractorWorkPaymentDueSchema = new Schema(
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

    driver_id: {
      type: String,
      required: true,
      index: true,
    },

    total_work_amount: {
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

const TractorWorkPaymentDue = model("Tractor-Work-PaymentDue", tractorWorkPaymentDueSchema);

exports.existingDue = async (farmer_id, driver_id, session) => {
  return TractorWorkPaymentDue.findOne({
    farmer_id,
    driver_id,
  }).session(session);
};


exports.updatePaymentDue = async (query, total_amount, due_id, session) => {
  return TractorWorkPaymentDue.findOneAndUpdate(
    query,
    {
      $inc: {
        total_work_amount: total_amount,
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

exports.findDue = async (farmer_id, driver_id, due_id, session) => {
  return TractorWorkPaymentDue.findOne({
    farmer_id,
    driver_id,
    due_id,
  }).session(session);
};

exports.applyPayment = async (query, amount, session) => {
  return TractorWorkPaymentDue.findOneAndUpdate(
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

exports.adjustDueByDiff = async (query, diff, session) => {
  return TractorWorkPaymentDue.findOneAndUpdate(
    query,
    {
      $inc: {
        total_work_amount: diff,
        balance_amount: diff,
      },
    },
    {
      new: true,
      session,
    }
  );
};


exports.TractorWorkPaymentDue = TractorWorkPaymentDue;
