import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { serviceRoutes } from './routes/services.js';
import { bookingRoutes } from './routes/bookings.js';
import { providerRoutes } from './routes/providers.js';
import { adminRoutes } from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
