import YahooFinance from 'yahoo-finance2';
const yfClass = (YahooFinance.default || YahooFinance);
const yf = new yfClass({ validation: { logErrors: false } });

async function test() {
  const quote = await yf.quote('AAPL');
  console.log("quoteType:", quote.quoteType);
  console.log("exchange:", quote.exchange);
  console.log("fullExchangeName:", quote.fullExchangeName);
}
test();
