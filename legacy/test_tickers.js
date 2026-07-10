import YahooFinance from 'yahoo-finance2';
const yfClass = (YahooFinance.default || YahooFinance);
const yf = new yfClass({ validation: { logErrors: false } });

async function test() {
  const syms = ['^GSPC', '^IXIC', 'BND', 'GLD', 'BTC-USD', 'EURUSD=X', 'CL=F'];
  for (const s of syms) {
    try {
      await yf.quote(s);
      console.log(s, "OK");
    } catch(e) {
      console.log(s, "FAIL", e.message);
    }
  }
}
test();
