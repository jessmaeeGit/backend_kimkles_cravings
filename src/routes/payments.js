import express from 'express';
import PayPalService from '../services/paypalService.js';
// import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Create PayPal payment order
 * POST /api/payments/paypal/create-order
 */
router.post('/paypal/create-order', async (req, res) => {
  try {
    const { 
      items, 
      total, 
      currency = 'PHP',
      returnUrl,
      cancelUrl 
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Items are required and must be an array' 
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Total amount must be greater than 0' 
      });
    }

    // Validate items structure
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: 'Each item must have name, price, and quantity' 
        });
      }
    }

    const result = await PayPalService.createOrder({
      items,
      total,
      currency,
      returnUrl: returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success`,
      cancelUrl: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/cancel`
    });

    if (result.success) {
      res.json({
        success: true,
        orderId: result.orderId,
        approvalUrl: result.approvalUrl,
        message: 'PayPal order created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Create PayPal order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Capture PayPal payment
 * POST /api/payments/paypal/capture
 */
router.post('/paypal/capture', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    const result = await PayPalService.captureOrder(orderId);

    if (result.success) {
      res.json({
        success: true,
        transactionId: result.transactionId,
        status: result.status,
        message: 'Payment captured successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Capture PayPal payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get PayPal order details
 * GET /api/payments/paypal/order/:orderId
 */
router.get('/paypal/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await PayPalService.getOrderDetails(orderId);

    if (result.success) {
      res.json({
        success: true,
        order: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get PayPal order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PayPal webhook handler
 * POST /api/payments/paypal/webhook
 */
router.post('/paypal/webhook', async (req, res) => {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    
    // Verify webhook signature
    const isValid = PayPalService.verifyWebhook(req.headers, req.body, webhookId);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const event = req.body;
    console.log('PayPal webhook received:', event.event_type);

    // Handle different webhook events
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Handle successful payment capture
        console.log('Payment captured successfully:', event.resource);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
        // Handle denied payment
        console.log('Payment denied:', event.resource);
        break;
      
      case 'PAYMENT.CAPTURE.REFUNDED':
        // Handle refund
        console.log('Payment refunded:', event.resource);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event_type);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

export default router;
