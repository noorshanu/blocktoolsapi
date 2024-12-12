const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://nooralam:aMwaDO0wUdjBZPb4@cluster0.rajwg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",{} );
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process if there is a connection error
  }
};


module.exports = connectDB;
