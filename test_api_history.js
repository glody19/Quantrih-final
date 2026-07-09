import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/stock/history/SPY?range=1mo&interval=1d');
  if (!res.ok) {
    const err = await res.json();
    console.log("Error response:", err);
  } else {
    const data = await res.json();
    console.log("Success data length:", data.length);
  }
}
test();
