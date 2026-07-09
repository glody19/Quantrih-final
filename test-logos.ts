import https from 'https';

const testUrl = (url) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
       resolve({url, status: res.statusCode});
    }).on('error', (e) => resolve({url, error: e.message}));
  });
};

async function main() {
  const symbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA'];
  const urls = [
      (s) => `https://financialmodelingprep.com/image-stock/${s}.png`,
      (s) => `https://eodhd.com/img/logos/US/${s}.png`,
      (s) => `https://assets.parqet.com/logos/symbol/${s}?format=png`,
      (s) => `https://images.financialmodelingprep.com/symbol/${s}.png`
  ];
  
  for (let s of symbols) {
     for (let uf of urls) {
        const url = uf(s);
        const r = await testUrl(url);
        console.log(r);
     }
  }
}
main();
