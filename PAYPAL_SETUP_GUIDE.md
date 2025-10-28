# PayPal Backend Setup Guide

## 1. Environment Variables Setup

Create a `.env` file in your `backend_kimkles_cravings` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kimkles_cravings
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server Configuration
PORT=8000
JWT_SECRET=your_jwt_secret_key

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
# For production, change to 'live'

# PayPal Webhook Configuration (optional)
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id

# Frontend URL (for return URLs)
FRONTEND_URL=http://localhost:3000
```

## 2. Get PayPal Credentials

### For Sandbox (Testing):
1. Go to [PayPal Developer Portal](https://developer.paypal.com/)
2. Sign in with your PayPal account
3. Create a new app or use the default sandbox app
4. Copy the **Client ID** and **Client Secret**
5. Add them to your `.env` file

### For Production (Live):
1. Switch to "Live" mode in the developer portal
2. Create a new live app
3. Copy the **Client ID** and **Client Secret**
4. Update your `.env` file with live credentials

## 3. Install Dependencies

Make sure you have the PayPal SDK installed:

```bash
cd backend_kimkles_cravings
npm install @paypal/paypal-server-sdk
```

## 4. Start the Server

```bash
npm start
```

## 5. Test the API Endpoints

### Test PayPal Order Creation:
```bash
curl -X POST http://localhost:8000/api/payments/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "Chocolate Brownie",
        "price": 150,
        "quantity": 2
      }
    ],
    "total": 300,
    "currency": "PHP"
  }'
```

### Test PayPal Order Capture:
```bash
curl -X POST http://localhost:8000/api/payments/paypal/capture \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "YOUR_PAYPAL_ORDER_ID"
  }'
```

### Test Get Order Details:
```bash
curl http://localhost:8000/api/payments/paypal/order/YOUR_PAYPAL_ORDER_ID
```

## 6. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/paypal/create-order` | Create a PayPal order |
| POST | `/api/payments/paypal/capture` | Capture a PayPal payment |
| GET | `/api/payments/paypal/order/:orderId` | Get order details |
| POST | `/api/payments/paypal/webhook` | Handle PayPal webhooks |

## 7. Request/Response Examples

### Create Order Request:
```json
{
  "items": [
    {
      "name": "Product Name",
      "price": 100,
      "quantity": 1
    }
  ],
  "total": 100,
  "currency": "PHP",
  "returnUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

### Create Order Response:
```json
{
  "success": true,
  "orderId": "PAYPAL_ORDER_ID",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "message": "PayPal order created successfully"
}
```

### Capture Payment Request:
```json
{
  "orderId": "PAYPAL_ORDER_ID"
}
```

### Capture Payment Response:
```json
{
  "success": true,
  "transactionId": "PAYPAL_TRANSACTION_ID",
  "status": "COMPLETED",
  "message": "Payment captured successfully"
}
```

## 8. Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400` - Bad Request (validation errors)
- `500` - Internal Server Error

Error response format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

## 9. Security Notes

1. Never commit your `.env` file to version control
2. Use environment variables for all sensitive data
3. Implement proper error handling and logging
4. Validate all payment data on the backend
5. Use HTTPS in production

## 10. Production Deployment

1. Switch to live PayPal credentials
2. Update `PAYPAL_MODE` to `live`
3. Test thoroughly with small amounts
4. Monitor payment logs and webhooks
5. Implement proper error monitoring

## Troubleshooting

### Common Issues:

1. **"Invalid Client ID" Error**
   - Check your PayPal credentials
   - Ensure you're using the correct environment (sandbox/live)

2. **"Failed to create PayPal order" Error**
   - Check your internet connection
   - Verify PayPal API endpoints are accessible
   - Check server logs for detailed errors

3. **Webhook Issues**
   - Ensure webhook URL is publicly accessible
   - Check webhook configuration in PayPal dashboard
   - Verify webhook signature validation
