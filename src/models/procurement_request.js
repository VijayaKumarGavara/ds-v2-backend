const { Schema, model } = require("mongoose");

const procurementRequestSchema = new Schema(
  {
    request_id: {
      type: String,
      required: true,
      unique: true,
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

    crop_units: {
      type: String,
      enum: ["kg", "quintal", "ton"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "finalized", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const ProcurementRequest = model(
  "Procurement_Request",
  procurementRequestSchema,
);

exports.createProcurementRequest = async (data, session) => {
  const procurementRequest = new ProcurementRequest(data);
  const result = await procurementRequest.save({session});
  return result;
};

exports.updateProcurementRequest = async (query, data, options = {}) => {
  return ProcurementRequest.findOneAndUpdate(query, data, {
    returnDocument: "after",
    ...options,
  });
};

exports.deleteProcurementRequest = async (request_id, buyer_id) => {
  return ProcurementRequest.deleteOne({
    request_id,
    buyer_id, // ownership protection
  });
};

exports.getProcurementRequestStatus = async (request_id) => {
  return ProcurementRequest.findOne({ request_id });
};

exports.getProcurementRequests = async (buyer_id) => {
  return ProcurementRequest.find(
    { buyer_id },
    {
      request_id: 1,
      farmer_id: 1,
      crop_id: 1,
      quantity: 1,
      crop_units: 1,
      status: 1,
      createdAt: 1,
    },
  ).sort({ createdAt: -1 });
};

exports.ProcurementRequest = ProcurementRequest;
