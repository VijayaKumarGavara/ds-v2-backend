const express=require("express");

const tractorWorkController=require("../controllers/tractorWorkController");

const router=express.Router();

router.post("/add-work", tractorWorkController.createTractorWork);
router.patch("/update-work", tractorWorkController.updateTractorWork);
router.delete("/delete-work", tractorWorkController.deleteTractorWork);

module.exports=router;