const express = require("express");

const { ConnectDB } = require("./config/database");

const farmerRoutes = require("./routes/farmerRoutes");
const buyerRoutes = require("./routes/buyerRoutes");
const cropRoutes = require("./routes/cropRoutes");
const app = express();

app.use(express.json());

app.use("/api/farmer", farmerRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/crop", cropRoutes);
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
