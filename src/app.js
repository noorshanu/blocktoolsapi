const express = require('express');
const connectDB = require('./database/connection');
const authRoutes = require('./routes/authRoutes');
const rpcRoutes = require('./routes/rpcRoutes');
const walletRoutes = require('./routes/walletRoutes');
const externalRoutes = require('./routes/externalRoutes');
const ethersRoutes = require('./routes/ethersRoutes');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;
const corsOptions = {
   origin: '*', // Allow all origins (you can specify specific origins here)
   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
   credentials: true, // Enable cookies to be sent with requests
   optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
 };
 
 // Enable CORS with the defined options
 app.use(cors(corsOptions));
 

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/', (req, res) => {
   res.send('REST API / SUCCESS::: Seems like you are not authorized to access this page. Please check the API documentation for more information.');
 });


// Routes
app.use('/auth', authRoutes); // For user registration
app.use('/rpc', rpcRoutes);   // For saving RPC URLs
app.use('/wallet', walletRoutes); // For creating worker wallets
app.use('/external',externalRoutes)
app.use('/ethers',ethersRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
