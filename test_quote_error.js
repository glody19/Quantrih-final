import yf from 'yahoo-finance2';
async function test() {
  try {
    const res = await yf.quote('NONEXISTENT_SYMBOL_V123');
    console.log(res);
  } catch(e) {
    console.error("Caught error:", e.message);
  }
}
test();
