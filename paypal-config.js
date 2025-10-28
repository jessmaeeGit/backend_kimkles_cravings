// PayPal Configuration
export const paypalConfig = {
  // For development/testing - use sandbox credentials
  sandbox: {
    clientId: process.env.PAYPAL_CLIENT_ID || 'your_sandbox_client_id',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'your_sandbox_client_secret',
    environment: 'sandbox'
  },
  
  // For production - use live credentials
  live: {
    clientId: process.env.PAYPAL_LIVE_CLIENT_ID || 'your_live_client_id',
    clientSecret: process.env.PAYPAL_LIVE_CLIENT_SECRET || 'your_live_client_secret',
    environment: 'live'
  }
};

// Get current environment configuration
export const getPayPalConfig = () => {
  const mode = process.env.PAYPAL_MODE || 'sandbox';
  return paypalConfig[mode];
};

// PayPal API endpoints
export const paypalEndpoints = {
  sandbox: 'https://api.sandbox.paypal.com',
  live: 'https://api.paypal.com'
};

// Currency configuration
export const currencyConfig = {
  currency: 'PHP', // Philippine Peso
  locale: 'en_PH'
};
