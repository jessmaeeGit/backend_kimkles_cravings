// import express from 'express';
// import pool from '../config/database.js';
// import { authenticateToken, requireAdmin } from '../middleware/auth.js';

// const router = express.Router();

// // Get all products
// router.get('/', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT p.*, c.name as category_name 
//       FROM products p 
//       LEFT JOIN categories c ON p.category_id = c.id 
//       WHERE p.available = true 
//       ORDER BY p.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Get products error:', error);
//     res.status(500).json({ error: 'Failed to fetch products' });
//   }
// });

// // Get product by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query(`
//       SELECT p.*, c.name as category_name 
//       FROM products p 
//       LEFT JOIN categories c ON p.category_id = c.id 
//       WHERE p.id = $1
//     `, [id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Get product error:', error);
//     res.status(500).json({ error: 'Failed to fetch product' });
//   }
// });

// // Create product (admin only)
// router.post('/', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { name, description, price, category_id, image_url, stock } = req.body;

//     if (!name || !price || !category_id) {
//       return res.status(400).json({ error: 'Name, price, and category are required' });
//     }

//     const result = await pool.query(
//       'INSERT INTO products (name, description, price, category_id, image_url, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
//       [name, description, price, category_id, image_url, stock || 0]
//     );

//     res.status(201).json({
//       message: 'Product created successfully',
//       product: result.rows[0]
//     });
//   } catch (error) {
//     console.error('Create product error:', error);
//     res.status(500).json({ error: 'Failed to create product' });
//   }
// });

// // Update product (admin only)
// router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, description, price, category_id, image_url, available, stock } = req.body;

//     const result = await pool.query(
//       'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, image_url = $5, available = $6, stock = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
//       [name, description, price, category_id, image_url, available, stock, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     res.json({
//       message: 'Product updated successfully',
//       product: result.rows[0]
//     });
//   } catch (error) {
//     console.error('Update product error:', error);
//     res.status(500).json({ error: 'Failed to update product' });
//   }
// });

// // Delete product (admin only)
// router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     res.json({ message: 'Product deleted successfully' });
//   } catch (error) {
//     console.error('Delete product error:', error);
//     res.status(500).json({ error: 'Failed to delete product' });
//   }
// });

// export default router;
