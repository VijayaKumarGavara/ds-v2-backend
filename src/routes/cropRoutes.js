const express = require("express");
const cropController = require("../controllers/cropController");

const router = express.Router();

router.post("/add-crop", cropController.addCrop);
router.get("/all-crops", cropController.getCrops);
router.patch("/update", cropController.updateCrop);
module.exports = router;
