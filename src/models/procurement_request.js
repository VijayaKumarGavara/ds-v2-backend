const { Schema, model } = require("mongoose");

const procurementRequestScheam = Schema(
  {
    request_id: { type: String },
    farmer_id: { type: String },
    buyer_id: { type: String },
    crop_id: { type: String },
    quantity: { type: Number },
    status: { type: String },
  },
  { timestamps: true }
);

const ProcurementRequest = model(
  "Procurement_Request",
  procurementRequestScheam
);

exports.createProcurementRequest = async (data) => {
  try {
    const procurementRequest = new ProcurementRequest(data);
    const result = await procurementRequest.save();
    return result;
  } catch (error) {
    throw error;
  }
};

exports.updateProcurementRequest = async (request_id, data) => {
  try {
    const updatedData = await ProcurementRequest.findOneAndUpdate(
      { request_id: request_id },
      data,
      { returnDocument: "after" }
    );
    return updatedData;
  } catch (error) {
    throw error;
  }
};

exports.deleteProcurementRequest = async (request_id) => {
  try {
    const count = await ProcurementRequest.deleteOne({
      request_id: request_id,
    });

    return count;
  } catch (error) {
    throw error;
  }
};

exports.getProcurementRequestStatus = async (request_id) => {
  try {
    const result = await ProcurementRequest.findOne({
      request_id: request_id,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

exports.getProcurementRequests = async (buyer_id) => {
  try {
    const result = await ProcurementRequest.find({
      buyer_id: buyer_id,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
