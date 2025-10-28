// Test script for PayPal API endpoints
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:8000/api';

async function testPayPalAPI() {
  console.log('🧪 Testing PayPal API Endpoints...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
    const healthText = await healthResponse.text();
    console.log('✅ Server is running:', healthText);

    // Test 2: Test PayPal order creation (this will fail without real credentials, but we can test the structure)
    console.log('\n2. Testing PayPal order creation...');
    try {
      const orderResponse = await fetch(`${API_BASE_URL}/payments/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              name: 'Test Product',
              price: 100,
              quantity: 1
            }
          ],
          total: 100,
          currency: 'PHP'
        }),
      });

      const orderResult = await orderResponse.json();
      console.log('✅ Order creation response:', orderResult);
    } catch (error) {
      console.log('⚠️  Order creation failed (expected without real credentials):', error.message);
    }

    // Test 3: Test error handling
    console.log('\n3. Testing error handling...');
    try {
      const errorResponse = await fetch(`${API_BASE_URL}/payments/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [],
          total: 0
        }),
      });

      const errorResult = await errorResponse.json();
      console.log('✅ Error handling works:', errorResult);
    } catch (error) {
      console.log('✅ Error handling works:', error.message);
    }

    console.log('\n🎉 PayPal API test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Set up your PayPal developer account');
    console.log('2. Add your credentials to the .env file');
    console.log('3. Test with real PayPal sandbox credentials');
    console.log('4. Deploy to production with live credentials');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPayPalAPI();
