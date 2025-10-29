// Test PayPal client initialization
import { Client, Environment } from '@paypal/paypal-server-sdk';
import { getPayPalConfig } from './paypal-config.js';

console.log('Testing PayPal client initialization...');

try {
  const config = getPayPalConfig();
  console.log('Config loaded:', {
    clientId: config.clientId ? '***' + config.clientId.slice(-4) : 'undefined',
    clientSecret: config.clientSecret ? '***' + config.clientSecret.slice(-4) : 'undefined',
    environment: config.environment
  });

  if (!config.clientId || !config.clientSecret) {
    console.log('❌ PayPal credentials not configured');
    process.exit(1);
  }

  const client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: config.clientId,
      oAuthClientSecret: config.clientSecret
    },
    environment: config.environment === 'sandbox' 
      ? Environment.Sandbox 
      : Environment.Production
  });

  console.log('✅ PayPal client created successfully');
  console.log('Client properties:', Object.getOwnPropertyNames(client));
  
  // Check the request builder factory
  const factory = client.getRequestBuilderFactory();
  console.log('Request builder factory:', typeof factory);
  
  // Try to import controllers directly
  try {
    const { OrdersController } = await import('@paypal/paypal-server-sdk');
    console.log('OrdersController imported:', !!OrdersController);
    
    if (OrdersController) {
      const ordersController = new OrdersController(client);
      console.log('OrdersController instance created:', !!ordersController);
      console.log('OrdersController methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(ordersController)));
    }
  } catch (importError) {
    console.log('Failed to import OrdersController:', importError.message);
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
