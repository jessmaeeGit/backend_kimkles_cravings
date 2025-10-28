import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DB_URL || process.env.DATABASE_URL || 'postgresql://localhost:5432/kimkles_cravings',
  ssl: (process.env.DB_URL || process.env.DATABASE_URL) ? { rejectUnauthorized: false } : false
});

// Test database connection
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize database tables
export const initDB = async () => {
  try {
    const client = await pool.connect();
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        password_hash VARCHAR(255) NOT NULL,
        profile_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // await client.query(`
    //   CREATE TABLE IF NOT EXISTS categories (
    //     id SERIAL PRIMARY KEY,
    //     name VARCHAR(50) UNIQUE NOT NULL,
    //     description TEXT,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   );
    // `);

    // await client.query(`
    //   CREATE TABLE IF NOT EXISTS products (
    //     id SERIAL PRIMARY KEY,
    //     name VARCHAR(100) NOT NULL,
    //     description TEXT,
    //     price DECIMAL(10,2) NOT NULL,
    //     category_id INTEGER REFERENCES categories(id),
    //     image_url VARCHAR(255),
    //     available BOOLEAN DEFAULT true,
    //     stock INTEGER DEFAULT 0,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   );
    // `);

    // await client.query(`
    //   CREATE TABLE IF NOT EXISTS orders (
    //     id SERIAL PRIMARY KEY,
    //     order_number VARCHAR(20) UNIQUE NOT NULL,
    //     customer_id INTEGER REFERENCES users(id),
    //     customer_name VARCHAR(100),
    //     customer_phone VARCHAR(20),
    //     customer_address TEXT,
    //     subtotal DECIMAL(10,2) NOT NULL,
    //     delivery_fee DECIMAL(10,2) DEFAULT 0,
    //     total DECIMAL(10,2) NOT NULL,
    //     status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
    //     payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending', 'Failed', 'Refunded')),
    //     payment_method VARCHAR(20) CHECK (payment_method IN ('paypal', 'gcash', 'maya', 'cod', 'card')),
    //     transaction_id VARCHAR(50),
    //     special_instructions TEXT,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   );
    // `);

    // await client.query(`
    //   CREATE TABLE IF NOT EXISTS order_items (
    //     id SERIAL PRIMARY KEY,
    //     order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    //     product_id INTEGER REFERENCES products(id),
    //     product_name VARCHAR(100) NOT NULL,
    //     product_price DECIMAL(10,2) NOT NULL,
    //     quantity INTEGER NOT NULL,
    //     subtotal DECIMAL(10,2) NOT NULL,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   );
    // `);

    // await client.query(`
    //   CREATE TABLE IF NOT EXISTS notifications (
    //     id SERIAL PRIMARY KEY,
    //     user_id INTEGER REFERENCES users(id),
    //     title VARCHAR(200) NOT NULL,
    //     message TEXT NOT NULL,
    //     type VARCHAR(50) DEFAULT 'general',
    //     read_status BOOLEAN DEFAULT false,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   );
    // `);

    // await client.query(`
    //   CREATE TABLE IF NOT EXISTS admin_notifications (
    //     id SERIAL PRIMARY KEY,
    //     title VARCHAR(200) NOT NULL,
    //     message TEXT NOT NULL,
    //     type VARCHAR(50) DEFAULT 'admin',
    //     read_status BOOLEAN DEFAULT false,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   );
    // `);

    // // Insert default data
    // await client.query(`
    //   INSERT INTO categories (name, description) VALUES 
    //   ('Brownies', 'Delicious chocolate brownies'),
    //   ('Cookies', 'Fresh baked cookies'),
    //   ('Crinkles', 'Soft and chewy crinkles')
    //   ON CONFLICT (name) DO NOTHING;
    // `);

    // Insert admin user if not exists
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('kimkles2021', 10);
    
    await client.query(`
      INSERT INTO users (username, name, phone, address, role, password_hash) VALUES 
      ('kimkles.admin', 'Kimkles Administrator', '09123456789', 'Kimkles Main Office', 'admin', $1)
      ON CONFLICT (username) DO NOTHING;
    `, [hashedPassword]);

    // Insert sample products
    // await client.query(`
    //   INSERT INTO products (name, description, price, category_id, available, stock) VALUES
    //   ('Chocolate Brownie', 'Rich chocolate brownie with nuts', 45.00, 1, true, 50),
    //   ('Vanilla Cookie', 'Soft vanilla cookie with chocolate chips', 25.00, 2, true, 100),
    //   ('Red Velvet Crinkle', 'Soft red velvet crinkle cookie', 30.00, 3, true, 75),
    //   ('Double Chocolate Brownie', 'Extra chocolate brownie', 50.00, 1, true, 40),
    //   ('Oatmeal Cookie', 'Healthy oatmeal cookie', 20.00, 2, true, 60),
    //   ('Chocolate Crinkle', 'Classic chocolate crinkle', 35.00, 3, true, 80)
    //   ON CONFLICT DO NOTHING;
    // `);

    client.release();
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

export default pool;
