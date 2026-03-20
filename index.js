const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://yuva-naya-dal-admin-panel.vercel.app'
  ],
  credentials: true,
}));

// Serve static folder
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/membership', require('./routes/membershipRoutes.js'));
app.use('/api/enquiries', require('./routes/enquiryRoutes.js'));
app.use('/api/media', require('./routes/mediaRoutes.js'));
app.use('/api/admin', require('./routes/adminRoutes.js'));

// Basic testing route
app.get('/', (req, res) => {
  res.send('Yuva Nyay Dal API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
