const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const wardRoutes = require('./routes/wards');
const routeRoutes = require('./routes/routes');
const scheduleRoutes = require('./routes/schedules');
const complaintRoutes = require('./routes/complaints');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET must be set before starting the API');
  process.exit(1);
}

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'EcoCollect API is running',
    adminRegistrationConfigured: Boolean(process.env.ADMIN_INVITE_CODE?.trim())
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'API endpoint not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecocollect';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`EcoCollect API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
