const Procurement = require("../models/procurement");
const ProcurementRequest = require("../models/procurement_request");

exports.createProcurement = async (req, res) => {
  try {
    const procurementInfo = req.body;
    const total_amount =
      procurementInfo.quantity * procurementInfo.cost_per_unit;
    procurementInfo.total_amount = total_amount;
    const update = await ProcurementRequest.updateProcurementRequest(
      procurementInfo.request_id,
      { status: "finalized" }
    );
    
    const result = await Procurement.createProcurement(procurementInfo);

    res.status(200).send({
      success: true,
      data: result,
      message: "Successfully created the procurement.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error,
      message: "Failed to create the procurement.",
    });
  }
};
