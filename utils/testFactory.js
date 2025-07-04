const mongoose = require("mongoose");
const { factory } = require("../utils/seed_db"); // adjust path if needed
require("dotenv").config();

async function testBuild() {
  try {
    console.log("factory:", factory);
    // Connect to your test database
    await mongoose.connect(process.env.MONGO_URI_TEST);
    
    const user = await factory.build("user");
    console.log("Built user:", user);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error building user:", err);
  }
}

testBuild();