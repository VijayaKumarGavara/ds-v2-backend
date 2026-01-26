const express = require("express");
const cropController = require("../controllers/cropController");

const router = express.Router();

router.post("/add-crop", cropController.addCrop);
router.get("/all-crops", cropController.getCrops);
router.patch("/update", cropController.updateCrop);
router.get("/get-units", cropController.getCropUnits);
module.exports = router;
