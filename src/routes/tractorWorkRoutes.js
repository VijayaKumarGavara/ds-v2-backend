const express=require("express");

const tractorWorkController=require("../controllers/tractorWorkController");
const authenticate = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");

const router=express.Router();

router.post("/add-work", tractorWorkController.createTractorWork);
router.patch("/update-work",authenticate, authorizeRole("driver"), tractorWorkController.updateTractorWork);
router.delete("/delete-work",authenticate, authorizeRole("driver"), tractorWorkController.deleteTractorWork);

module.exports=router;