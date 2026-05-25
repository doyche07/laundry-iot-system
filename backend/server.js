require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const machineRoutes = require('./routes/machines');
const logRoutes = require('./routes/logs');

const app = express();

// CHANGE HERE: frontend URL during development or Render frontend URL
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*'
}));

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Laundry IoT backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});