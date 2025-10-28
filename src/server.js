import userRoutes from './routes/users.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';  // ✅ Make sure this is imported before using it

dotenv.config();  // ✅ Call it after import

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));