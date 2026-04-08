const mongoose = require("mongoose");
require('dotenv').config();

const db_url=process.env.MONGO_DB_URL;
const local_db_url=process.env.LOCAL_MONGO_DB_URL;

async function ConnectDB() {
  try {
    await mongoose.connect(local_db_url);
  } catch (error) {
    console.log("Error while connecting Database,", error);
  }
}

module.exports = { ConnectDB };
