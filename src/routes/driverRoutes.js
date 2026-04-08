const express=require("express");
const driverController=require("../controllers/driverController");
const upload=require("../middlewares/uploadDriver");


const router=express.Router();

router.post("/register",upload.single("driver_photo"),  driverController.registerDriver);
router.post("/login", driverController.loginDriver);
router.patch("/update", driverController.updateProfile);
router.get("/profile", driverController.getProfile);

module.exports=router;