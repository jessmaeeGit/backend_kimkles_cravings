import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [
      username,
    ]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    
    // Check if password_hash exists
    if (!user.password_hash) {
      console.error('User found but no password_hash:', user);
      return res.status(500).json({ error: 'User account error - no password set' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, username, password, address, phone, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, username, password_hash, address, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, username, hashedPassword, address, phone, role],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
