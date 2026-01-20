const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    transaction_id: { type: String }, // e.g. T20240901001

    buyer_id: { type: String, required: true },
    farmer_id: { type: String, required: true },

    amount: { type: Number, required: true },

    payment_mode: {
      type: String,
      enum: ["cash", "upi", "bank", "cheque", "other"],
    },

    remarks: { type: String },
    balance_before: { type: Number },
    balance_after: { type: Number },
  },
  { timestamps: true }
);

const Transaction = model("Transaction", transactionSchema);

exports.createTransaction = async (transactionInfo, session) => {
  try {
    const [result] = await Transaction.create(
      [transactionInfo], // ✅ ARRAY is required
      { session }
    );
    return result;
  } catch (error) {
    throw error;
  }
};
exports.Transaction = Transaction;
