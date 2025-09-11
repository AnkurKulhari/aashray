const mongoose = require('mongoose');

const connectDB = async (mongoUrl) => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUrl, {
      autoIndex: true,
    });
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

