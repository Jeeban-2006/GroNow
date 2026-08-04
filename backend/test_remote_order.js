const axios = require('axios');

async function testPlaceOrder() {
    try {
        // 1. Sign up a new customer
        const phone = '99' + Math.floor(Math.random() * 100000000);
        const signupRes = await axios.post('https://gronow-backend-z3vh.onrender.com/api/auth/register', {
            first_name: 'Test',
            last_name: 'User',
            email: `test${Date.now()}@test.com`,
            phone: phone,
            password: 'password123',
            role: 'CUSTOMER'
        });
        const token = signupRes.data.token;
        console.log('Got token:', token);

        // 2. Fetch products to get a valid product ID
        const prodRes = await axios.get('https://gronow-backend-z3vh.onrender.com/api/catalog/products', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const product = prodRes.data[0];
        console.log('Using product:', product.id);

        // 3. Update profile with address (simulating LOCATION step)
        await axios.put('https://gronow-backend-z3vh.onrender.com/api/profile', {
            first_name: 'Test',
            last_name: 'User',
            phone_number: phone,
            address: '123 Test St',
            city: 'Bhubaneswar',
            pincode: '751001'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Profile updated');

        // 4. Place Order
        const orderRes = await axios.post('https://gronow-backend-z3vh.onrender.com/api/orders', {
            items: [{ productId: product.id, quantity: 1, price: product.price }]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Order result:', orderRes.data);

        // 5. Get Active Orders
        const getOrders = await axios.get('https://gronow-backend-z3vh.onrender.com/api/orders', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Active orders:', getOrders.data);

    } catch (e) {
        console.error('ERROR:', e.response ? e.response.data : e.message);
    }
}

testPlaceOrder();
