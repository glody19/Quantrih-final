import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/stock/quote/AAPL');
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', data);
}

test();
