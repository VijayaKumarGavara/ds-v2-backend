const mongoose = require("mongoose");

async function ConnectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/Dhanya-Sethu");
  } catch (error) {
    console.log("Error while connecting Database,", error);
  }
}

module.exports = { ConnectDB };
