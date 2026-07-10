import YahooFinance from 'yahoo-finance2';
const yfClass = (YahooFinance.default || YahooFinance);
const yf = new yfClass({ validation: { logErrors: false } });

async function test() {
  try {
    const res = await yf.quote('NMS:AAPL');
    console.log("quote success:", res);
  } catch(e) {
    console.error("Caught quote error:", e.message);
  }
}
test();
