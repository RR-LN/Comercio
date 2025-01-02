import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
}

const BASE_URL = 'http://localhost:8000/api'

export default function() {
  const credentials = {
    email: `user_${__VU}@example.com`,
    password: 'password123',
  }

  // Login
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify(credentials), {
    headers: { 'Content-Type': 'application/json' },
  })

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  })

  const token = loginRes.json('token')
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // Get products
  const productsRes = http.get(`${BASE_URL}/products`, { headers })
  check(productsRes, {
    'products loaded': (r) => r.status === 200,
    'products not empty': (r) => r.json('results').length > 0,
  })

  // Add to cart
  const cartRes = http.post(`${BASE_URL}/cart/items`, JSON.stringify({
    productId: 'product-1',
    quantity: 1,
  }), { headers })

  check(cartRes, {
    'item added to cart': (r) => r.status === 200,
  })

  // Checkout
  const checkoutRes = http.post(`${BASE_URL}/checkout`, JSON.stringify({
    paymentMethod: 'stripe',
    shippingAddress: {
      name: 'Test User',
      address: '123 Test St',
      city: 'Test City',
      zipCode: '12345',
    },
  }), { headers })

  check(checkoutRes, {
    'checkout successful': (r) => r.status === 200,
  })

  sleep(1)
} 