import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

console.log('Environment variables:');
console.log('DB_URL:', process.env.DB_URL);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const connectionString = process.env.DB_URL || process.env.DATABASE_URL || 'postgresql://localhost:5432/kimkles_cravings';
console.log('Using connection string:', connectionString);

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString.includes('railway') ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    const result = await client.query('SELECT NOW()');
    console.log('Current time from database:', result.rows[0].now);
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();


