import userRoutes from './routes/users.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Root test
app.get('/', (req, res) => {
  res.send('Backend API is running 🚀');
});