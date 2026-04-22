import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import testRoutes from './routes/testRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth requests. Please try again later.' },
});

// Core middleware
app.use(helmet());
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

// API routes
app.use('/api', testRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);

app.get('/', (req, res) => {
  res.send('Smart Agriculture API is running');
});

app.use(errorHandler);

const startServer = async () => {
  const isDbConnected = await connectDB();
  if (!isDbConnected) {
    console.warn('Continuing without MongoDB. Check your MongoDB credentials or URI.');
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
