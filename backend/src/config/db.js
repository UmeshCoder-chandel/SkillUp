const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 5000) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    if (retries > 0) {
      console.log(`Retrying MongoDB connection in ${delay / 1000} seconds... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1, delay), delay);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
