const express = require("express");
const cors = require("cors");
const { ConnectDB } = require("./config/database");

const farmerRoutes = require("./routes/farmerRoutes");
const buyerRoutes = require("./routes/buyerRoutes");
const cropRoutes = require("./routes/cropRoutes");
const procurementRequestRoutes = require("./routes/procurementReuqestRoutes");
const procurementRoutes = require("./routes/procurementRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");


const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/crop", cropRoutes);
app.use("/api/procurement-request", procurementRequestRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/payment", paymentRoutes);

ConnectDB()
  .then(() => {
    console.log("Database connected successfully.");
    app.listen(3000, () => {
      console.log("Server is listening http://localhost:3000");
    });
  })
  .catch((error) => {
    console.log(error);
  });
