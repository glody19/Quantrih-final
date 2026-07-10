import YahooFinance from 'yahoo-finance2';
const yfClass = (YahooFinance.default || YahooFinance);
const yf = new yfClass({ validation: { logErrors: false } });

async function test() {
  try {
    const res = await yf.chart('NONEXISTENT_SYMBOL_V123', { period1: '2020-01-01' });
    console.log(res);
  } catch(e) {
    console.error("Caught error message:", e.message);
  }
}
test();
