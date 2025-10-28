import pool from './src/config/database.js';

async function testCustomerLogin() {
  try {
    console.log('Testing customer login...');
    
    const client = await pool.connect();
    
    // List all users
    const allUsersResult = await client.query('SELECT id, username, name, role FROM users ORDER BY id');
    console.log('All users in database:');
    allUsersResult.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Name: ${user.name}, Role: ${user.role}`);
    });
    
    // Test login for a customer user
    const customerUser = allUsersResult.rows.find(u => u.role === 'customer');
    if (customerUser) {
      console.log(`\nTesting login for customer: ${customerUser.username}`);
      
      // Test the login endpoint
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: customerUser.username,
          password: 'test123' // This might not work, but let's see what happens
        })
      });
      
      const data = await response.json();
      console.log('Login response:', { status: response.status, data });
    } else {
      console.log('No customer users found in database');
    }
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCustomerLogin();
