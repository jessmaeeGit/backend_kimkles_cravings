import userRoutes from './routes/users.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, initDB } from './config/database.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running 🚀');
});

const PORT = process.env.PORT || 8000;

// Initialize database and start server
const startServer = async () => {
  try {
    await connectDB();
    await initDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();