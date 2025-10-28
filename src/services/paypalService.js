import paypal from '@paypal/paypal-server-sdk';
import { getPayPalConfig, paypalEndpoints, currencyConfig } from '../paypal-config.js';

// Configure PayPal SDK
const config = getPayPalConfig();
const environment = new paypal.core.SandboxEnvironment(config.clientId, config.clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export class PayPalService {
  /**
   * Create a PayPal order
   * @param {Object} orderData - Order details
   * @param {Array} orderData.items - Array of order items
   * @param {number} orderData.total - Total amount
   * @param {string} orderData.currency - Currency code
   * @param {string} orderData.returnUrl - Return URL after payment
   * @param {string} orderData.cancelUrl - Cancel URL
   * @returns {Promise<Object>} PayPal order response
   */
  static async createOrder(orderData) {
    try {
      const { items, total, currency = currencyConfig.currency, returnUrl, cancelUrl } = orderData;
      
      // Calculate breakdown
      const itemTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = 0; // No tax for now
      const shipping = total - itemTotal;
      
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
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
              },
              tax_total: {
                currency_code: currency,
                value: tax.toFixed(2)
              }
            }
          },
          items: items.map(item => ({
            name: item.name,
            unit_amount: {
              currency_code: currency,
              value: item.price.toFixed(2)
            },
            quantity: item.quantity.toString(),
            category: 'PHYSICAL_GOODS'
          }))
        }],
        application_context: {
          brand_name: 'Kimkles Cravings',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: returnUrl,
          cancel_url: cancelUrl
        }
      });

      const response = await client.execute(request);
      return {
        success: true,
        orderId: response.result.id,
        approvalUrl: response.result.links.find(link => link.rel === 'approve')?.href,
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
   * @param {string} orderId - PayPal order ID
   * @returns {Promise<Object>} Capture response
   */
  static async captureOrder(orderId) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      const response = await client.execute(request);
      
      if (response.result.status === 'COMPLETED') {
        return {
          success: true,
          transactionId: response.result.purchase_units[0].payments.captures[0].id,
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
   * @param {string} orderId - PayPal order ID
   * @returns {Promise<Object>} Order details
   */
  static async getOrderDetails(orderId) {
    try {
      const request = new paypal.orders.OrdersGetRequest(orderId);
      const response = await client.execute(request);
      
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
   * @param {Object} headers - Request headers
   * @param {string} body - Request body
   * @param {string} webhookId - PayPal webhook ID
   * @returns {boolean} Verification result
   */
  static verifyWebhook(headers, body, webhookId) {
    try {
      // In a real implementation, you would verify the webhook signature
      // using PayPal's webhook verification process
      // For now, we'll do a basic check
      return headers['paypal-transmission-id'] && headers['paypal-cert-id'];
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }
}

export default PayPalService;
