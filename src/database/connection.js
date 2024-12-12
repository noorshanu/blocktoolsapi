const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://cryptomediac:noor1234@cluster0.tv3cs.mongodb.net/bundle?retryWrites=true&w=majority&appName=Cluster0s",{} );
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process if there is a connection error
  }
};


module.exports = connectDB;
