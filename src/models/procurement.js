const { Schema, model } = require("mongoose");

const procurementSchema = Schema(
  {
    procurement_id: { type: String },
    request_id: { type: String },
    farmer_id: { type: String },
    buyer_id: { type: String },
    crop_id: { type: String },
    quantity: { type: Number },
    cost_per_unit: { type: Number },
    total_amount: { type: Number },
  },
  { timestamps: { createdAt: "finalizedAt" } }
);

const Procurement = model("Procurement", procurementSchema);

exports.createProcurement = async (data) => {
  try {
    const procurment = new Procurement(data);
    const result = await procurment.save();
    return result;
  } catch (error) {
    throw error;
  }
};

exports.Procurement = Procurement;
