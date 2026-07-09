const yahooFinance = require('yahoo-finance2').default;
async function run() {
  try {
    const yf = yahooFinance;
    yf.suppressNotices(['yahooFinance.schemaValidation']);
    await yf.chart('IWDA.AS', { period1: '2020-01-01', interval: '1mo' });
  } catch(e) {
    console.log('e.name:', e.name, 'e.message:', e.message, 'has result:', !!e.result);
  }
}
run();
