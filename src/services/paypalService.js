import { Client, Environment } from '@paypal/paypal-server-sdk';
import { getPayPalConfig } from '../../paypal-config.js';

const config = getPayPalConfig();

// Create PayPal client
const paypalClient = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: config.clientId,
        oAuthClientSecret: config.clientSecret
    },
    environment: config.environment === 'sandbox' 
        ? Environment.Sandbox 
        : Environment.Production
});

export class PayPalService {
  /**
   * Create a PayPal order
   */
  static async createOrder(orderData) {
    try {
      const { items, total, currency = 'PHP', returnUrl, cancelUrl } = orderData;
      
      // Calculate breakdown
      const itemTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = total - itemTotal;
      
      const orderRequest = {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: `order_${Date.now()}`,
          amount: {
            currency_code: currency,
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: itemTotal.toFixed(2)
              },
              shipping: {
                currency_code: currency,
                value: shipping.toFixed(2)
              }
            }
          },
          items: items.map(item => ({
            name: item.name,
            unit_amount: {
              currency_code: currency,
              value: item.price.toFixed(2)
            },
            quantity: item.quantity.toString()
          }))
        }],
        application_context: {
          brand_name: 'Kimkles Cravings',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: returnUrl,
          cancel_url: cancelUrl
        }
      };

      const response = await paypalClient.ordersController.ordersCreate(orderRequest);
      
      return {
        success: true,
        orderId: response.result.id,
        approvalUrl: response.result.links?.find(link => link.rel === 'approve')?.href,
        data: response.result
      };
    } catch (error) {
      console.error('PayPal create order error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create PayPal order'
      };
    }
  }

  /**
   * Capture a PayPal order
   */
  static async captureOrder(orderId) {
    try {
      const response = await paypalClient.ordersController.ordersCapture(orderId, {});
      
      if (response.result.status === 'COMPLETED') {
        return {
          success: true,
          transactionId: response.result.purchase_units?.[0]?.payments?.captures?.[0]?.id,
          status: response.result.status,
          data: response.result
        };
      } else {
        return {
          success: false,
          error: 'Payment not completed',
          status: response.result.status
        };
      }
    } catch (error) {
      console.error('PayPal capture order error:', error);
      return {
        success: false,
        error: error.message || 'Failed to capture PayPal order'
      };
    }
  }

  /**
   * Get order details from PayPal
   */
  static async getOrderDetails(orderId) {
    try {
      const response = await paypalClient.ordersController.ordersGet(orderId);
      
      return {
        success: true,
        data: response.result
      };
    } catch (error) {
      console.error('PayPal get order error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get PayPal order details'
      };
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhook(headers, body, webhookId) {
    try {
      return headers['paypal-transmission-id'] && headers['paypal-cert-id'];
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }
}

export default PayPalService;