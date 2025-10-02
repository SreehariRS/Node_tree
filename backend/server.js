const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodeRoutes = require('./routes/nodes');

dotenv.config();

const app = express();
app.use(express.json());
// Configure CORS for production and development
const allowedOrigins = [
  'http://localhost:3000', // Development
  'https://node-tree-sooty.vercel.app', // Production (Vercel) - hardcoded for now
  process.env.FRONTEND_URL // Production (Vercel) - from env var
].filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', nodeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));