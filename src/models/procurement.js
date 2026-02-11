const { Schema, model } = require("mongoose");

const procurementSchema = new Schema(
  {
    procurement_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    request_id: {
      type: String,
      required: true,
      index: true,
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

    crop_id: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    

    cost_per_unit: {
      type: Number,
      required: true,
      min: 0,
    },

    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["finalized", "cancelled"],
      default: "finalized",
    },

    agri_year: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "finalizedAt",
      updatedAt: false, // 🔒 important
    },
    strict: true,
  }
);

const Procurement = model("Procurement", procurementSchema);


exports.createProcurement = async (data) => {
  const procurement = new Procurement(data);
  return procurement.save();
};

exports.Procurement = Procurement;
