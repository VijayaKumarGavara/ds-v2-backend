const express=require("express");
const buyerController=require("../controllers/buyerController");

const router=express.Router();

router.post("/register", buyerController.registerBuyer);
router.post("/login", buyerController.loginBuyer);
router.patch("/update", buyerController.updateBuyer);
module.exports=router;