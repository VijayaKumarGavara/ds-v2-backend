const ProcurementRequest = require("../models/procurement_request");
const { generateId } = require("../utils/generateId");
const getAgriYear = require("../utils/getAgriYear");

exports.createProcurmentRequest = async (req, res) => {
  
  try {
    const procurementRequestInfo = {
      ...req.body,
      request_id: generateId("PR"),
      status: "pending",
      agri_year:getAgriYear(),
    };
    const result = await ProcurementRequest.createProcurementRequest(
      procurementRequestInfo,
    );
    res.status(200).send({
      success: true,
      data: result,
      message: "Successfully created the procurement request.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to add the procurement.",
    });
  }
};

exports.updateProcurementRequest = async (req, res) => {
  const { request_id } = req.body;
  try {
    let data = await ProcurementRequest.getProcurementRequestStatus(request_id);
    if (data.status === "finalized") {
      res.status(203).send({
        success: false,
        data: data,
        message: "Cann't update the finalized procurement requests.",
      });
      return;
    }
    const result = await ProcurementRequest.updateProcurementRequest(
      request_id,
      req.body,
    );
    res.status(200).send({
      success: true,
      data: result,
      message: "Successfully updated the procurement request.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to update the procurement.",
    });
  }
};

exports.deleteProcurementRequest = async (req, res) => {
  const { request_id } = req.body;
  try {
    let data = await ProcurementRequest.getProcurementRequestStatus(request_id);
    if (data.status === "finalized") {
      res.status(203).send({
        success: false,
        data: data,
        message: "Cann't delete the finalized procurement requests.",
      });
      return;
    }
    const result =
      await ProcurementRequest.deleteProcurementRequest(request_id);
    res.status(200).send({
      success: true,
      data: result,
      message: "Successfully deleted the procurement request.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to delete the procurement.",
    });
  }
};

exports.getProcurementRequests = async (req, res) => {
  const { buyer_id } = req.body;
  try {
    const result = await ProcurementRequest.getProcurementRequests(buyer_id);
    res.status(200).send({
      success: true,
      data: result,
      message: "Procurement Requests Fetched Succcessfully.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to fetch the procurement requests.",
    });
  }
};
