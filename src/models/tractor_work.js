const mongoose = require("mongoose");

const tractorWorkSchema = new mongoose.Schema(
  {
    work_id: {
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

    // Work Info
    work: {
      type: {
        type: String,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
      unit: {
        type: String,
        required: true,
      },
    },

    // Quantity (normalized)
    quantity: {
      type: Number, // always decimal (e.g. 1.83 hours)
      required: true,
    },

    cost_per_unit: {
      type: Number,
      required: true,
    },

    total_amount: {
      type: Number,
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },

    is_modified: {
      type: Boolean,
      default: false,
    },

    work_date: {
      type: Date,
      default: Date.now,
      index: true,
    },

    agri_year: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const TractorWork = mongoose.model("Tractor_Work", tractorWorkSchema);
exports.createTractorWork = async (data, session) => {
  const tractorWork = new TractorWork(data);
  const result = await tractorWork.save({ session });
  return result;
};

exports.updateTractorWork = async (query, data, options = {}) => {
  return TractorWork.findOneAndUpdate(query, data, {
    returnDocument: "after",
    ...options,
  });
};

exports.existingWork = async (work_id, session) => {
  return TractorWork.findOne({
    work_id,
  }).session(session);
};

exports.deleteOrCancelWork = async (
  work_id,
  hasPayment,
  session
) => {
  if (!hasPayment) {
    // HARD DELETE
    return TractorWork.deleteOne(
      { work_id },
      { session }
    );
  }

  // SOFT DELETE (cancel)
  return TractorWork.findOneAndUpdate(
    { work_id },
    {
      status: "cancelled",
      is_modified: true,
    },
    {
      new: true,
      session,
    }
  );
};

exports.TractorWork = TractorWork;
