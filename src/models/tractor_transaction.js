const { Schema, model } = require("mongoose");

const tractorTransactionSchema = new Schema(
  {
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      index: true, // fast lookup
    },

    driver_id: {
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

    discount: {
      type: Number,
      min: 0, // no negative payments
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

const TractorTransaction = model("Tractor-Transaction", tractorTransactionSchema);

exports.createTransaction = async (transactionInfo, session) => {
  const [result] = await TractorTransaction.create(
    [transactionInfo], 
    { session }
  );
  return result;
};

exports.TractorTransaction = TractorTransaction;
