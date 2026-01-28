const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      index: true, // fast lookup
    },

    buyer_id: {
      type: String,
      required: true,
      index: true,
    },

    farmer_id: {
      type: String,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1, // no zero / negative payments
    },

    payment_mode: {
      type: String,
      enum: ["cash", "upi", "bank", "cheque", "other"],
      default: "cash",
    },

    remarks: {
      type: String,
      trim: true,
    },

    balance_before: {
      type: Number,
      required: true,
      min: 0,
    },

    balance_after: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true, // createdAt = transaction time
    strict: true,
  }
);

const Transaction = model("Transaction", transactionSchema);

exports.createTransaction = async (transactionInfo, session) => {
  const [result] = await Transaction.create(
    [transactionInfo], 
    { session }
  );
  return result;
};

exports.Transaction = Transaction;
