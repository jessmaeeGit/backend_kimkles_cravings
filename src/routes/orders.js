// import express from 'express';
// import pool from '../config/database.js';
// import { authenticateToken, requireAdmin } from '../middleware/auth.js';

// const router = express.Router();

// // Create order
// router.post('/', authenticateToken, async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     await client.query('BEGIN');
    
//     const { 
//       items, 
//       customer_name, 
//       customer_phone, 
//       customer_address, 
//       payment_method, 
//       special_instructions 
//     } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({ error: 'Order items are required' });
//     }

//     // Calculate totals
//     const subtotal = items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
//     const deliveryFee = subtotal > 500 ? 0 : 50;
//     const total = subtotal + deliveryFee;

//     // Generate order number
//     const orderNumber = 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase();

//     // Create order
//     const orderResult = await client.query(
//       `INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, customer_address, 
//        subtotal, delivery_fee, total, payment_method, special_instructions, payment_status) 
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
//        RETURNING *`,
//       [
//         orderNumber, 
//         req.user.userId, 
//         customer_name, 
//         customer_phone, 
//         customer_address,
//         subtotal, 
//         deliveryFee, 
//         total, 
//         payment_method, 
//         special_instructions,
//         payment_method === 'cod' ? 'Pending' : 'Paid'
//       ]
//     );

//     const order = orderResult.rows[0];

//     // Create order items
//     for (const item of items) {
//       await client.query(
//         `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) 
//          VALUES ($1, $2, $3, $4, $5, $6)`,
//         [
//           order.id, 
//           item.product_id, 
//           item.product_name, 
//           item.product_price, 
//           item.quantity, 
//           item.product_price * item.quantity
//         ]
//       );
//     }

//     // Create admin notification
//     await client.query(
//       'INSERT INTO admin_notifications (title, message, type) VALUES ($1, $2, $3)',
//       [
//         'New Order Received 📦',
//         `Order #${orderNumber} from ${customer_name} - Total: ₱${total.toFixed(2)}`,
//         'new_order'
//       ]
//     );

//     // Create customer notification
//     await client.query(
//       'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
//       [
//         req.user.userId,
//         'Order Placed! ⏳',
//         `Your order #${orderNumber} has been placed and is pending approval. Total: ₱${total.toFixed(2)}`,
//         'order'
//       ]
//     );

//     await client.query('COMMIT');
    
//     res.status(201).json({
//       message: 'Order created successfully',
//       order: {
//         ...order,
//         items
//       }
//     });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Create order error:', error);
//     res.status(500).json({ error: 'Failed to create order' });
//   } finally {
//     client.release();
//   }
// });

// // Get user orders
// router.get('/my-orders', authenticateToken, async (req, res) => {
//   try {
//     const result = await pool.query(
//       'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
//       [req.user.userId]
//     );
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Get orders error:', error);
//     res.status(500).json({ error: 'Failed to fetch orders' });
//   }
// });

// // Get all orders (admin only)
// router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const result = await pool.query(
//       'SELECT * FROM orders ORDER BY created_at DESC'
//     );
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Get all orders error:', error);
//     res.status(500).json({ error: 'Failed to fetch orders' });
//   }
// });

// // Update order status (admin only)
// router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const result = await pool.query(
//       'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
//       [status, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.json({
//       message: 'Order status updated successfully',
//       order: result.rows[0]
//     });
//   } catch (error) {
//     console.error('Update order status error:', error);
//     res.status(500).json({ error: 'Failed to update order status' });
//   }
// });

// // Update payment status (admin only)
// router.put('/:id/payment', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { payment_status } = req.body;

//     const result = await pool.query(
//       'UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
//       [payment_status, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.json({
//       message: 'Payment status updated successfully',
//       order: result.rows[0]
//     });
//   } catch (error) {
//     console.error('Update payment status error:', error);
//     res.status(500).json({ error: 'Failed to update payment status' });
//   }
// });

// export default router;
