import { Client, Environment, OrdersController } from '@paypal/paypal-server-sdk';
import { getPayPalConfig } from '../../paypal-config.js';

// Create PayPal client and controller lazily
let paypalClient = null;
let ordersController = null;

const getOrdersController = () => {
  if (!ordersController) {
    if (!paypalClient) {
      const config = getPayPalConfig();
      
      console.log('PayPal config:', {
        clientId: config.clientId ? '***' + config.clientId.slice(-4) : 'undefined',
        clientSecret: config.clientSecret ? '***' + config.clientSecret.slice(-4) : 'undefined',
        environment: config.environment
      });
      
      if (!config.clientId || !config.clientSecret) {
        throw new Error('PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
      }
      
      try {
        paypalClient = new Client({
          clientCredentialsAuthCredentials: {
            oAuthClientId: config.clientId,
            oAuthClientSecret: config.clientSecret
          },
          environment: config.environment === 'sandbox' 
            ? Environment.Sandbox 
            : Environment.Production
        });
        
        console.log('PayPal client created successfully');
      } catch (error) {
        console.error('Failed to create PayPal client:', error);
        throw error;
      }
    }
    
    ordersController = new OrdersController(paypalClient);
    console.log('OrdersController created successfully');
  }
  return ordersController;
};

export class PayPalService {
  /**
   * Create a PayPal order
   */
  static async createOrder(orderData) {
    try {
      const client = getPayPalClient();
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

      console.log('Creating PayPal order with request:', JSON.stringify(orderRequest, null, 2));
      
      const response = await client.ordersController.ordersCreate(orderRequest);
      
      console.log('PayPal order response:', JSON.stringify(response, null, 2));
      
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
      const client = getPayPalClient();
      const response = await client.ordersController.ordersCapture(orderId, {});
      
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
      const client = getPayPalClient();
      const response = await client.ordersController.ordersGet(orderId);
      
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