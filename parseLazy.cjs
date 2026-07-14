const fs = require('fs');
const data = `-- Market Benchmark	Technology
-- Market Benchmark	1	100	0	0	34.14	16.44	22.06	14.10
-- Market Benchmark	US Stocks Momentum
-- Market Benchmark	1	100	0	0	43.67	15.92	17.56	13.36
-- Market Benchmark	Stocks/Bonds 80/20 Momentum
-- Market Benchmark	2	80	20	0	35.61	12.89	14.46	11.87
Warren Buffett	Berkshire Hathaway Active Fund
Warren Buffett	1	100	0	0	2.75	12.34	13.19	11.24
Davide Pisicchio	Diavola Portfolio
Davide Pisicchio	4	90	10	0	23.76	12.45	15.63	11.14
-- Market Benchmark	US Stocks Quality
-- Market Benchmark	1	100	0	0	21.16	11.87	14.45	11.13
-- Market Benchmark	US Stocks Equal Weight
-- Market Benchmark	1	100	0	0	19.02	8.94	12.13	10.49
-- Market Benchmark	US Stocks
-- Market Benchmark	1	100	0	0	23.17	12.24	15.04	10.30
-- Market Benchmark	Stocks/Bonds 60/40 Momentum
-- Market Benchmark	2	60	40	0	27.58	9.80	11.31	10.18
Warren Buffett	Warren Buffett Portfolio
Warren Buffett	2	90	10	0	19.95	11.91	14.18	9.84
Dedalo Invest	Dedalo Three
Dedalo Invest	2	100	0	0	23.50	11.85	14.39	9.76
Bill Bernstein	Sheltered Sam 100/0
Bill Bernstein	10	97	0	3	28.54	10.45	11.81	9.50
-- Market Benchmark	US Stocks Value
-- Market Benchmark	1	100	0	0	18.52	11.11	11.91	9.43
-- Market Benchmark	Stocks/Bonds 80/20
-- Market Benchmark	2	80	20	0	19.16	9.90	12.40	9.34
Alpha Architect	Robust
Alpha Architect	8	70	20	10	25.90	9.81	10.27	9.33
Aim Ways	Odd-Stats Strategy
Aim Ways	6	47	43	10	13.13	7.29	8.83	9.33
Aim Ways	Shield Strategy
Aim Ways	6	42	38	20	16.81	9.92	10.60	9.22
-- Market Benchmark	US Stocks Minimum Volatility
-- Market Benchmark	1	100	0	0	4.34	7.29	9.60	9.17
Lyn Alden	Aggressive Portfolio
Lyn Alden	8	85	10	5	22.57	9.58	11.06	9.14
Davide Pisicchio	Pepperoni Portfolio
Davide Pisicchio	5	60	40	0	17.22	8.62	11.05	9.12
JL Collins	Simple Path to Wealth
JL Collins	2	75	25	0	18.17	9.31	11.73	9.08
Bill Bernstein	Sheltered Sam 90/10
Bill Bernstein	12	87.3	10	2.7	25.88	9.57	10.86	9.06
Dedalo Invest	Dedalo Four
Dedalo Invest	3	80	20	0	19.18	9.65	11.89	8.97
Value Stock Geek	Weird Portfolio
Value Stock Geek	5	60	20	20	19.50	5.68	7.20	8.89
The Lazy Team	Aggressive Global Income
The Lazy Team	4	80	20	0	17.89	8.40	8.51	8.88
Frank Vasquez	Golden Ratio Portfolio
Frank Vasquez	6	42	32	26	19.53	7.20	8.70	8.87
Paul Merriman	Ultimate Buy and Hold Strategy
Paul Merriman	10	100	0	0	26.96	8.81	10.47	8.82
Betterment	Robo Advisor 100 Value Tilt
Betterment	6	100	0	0	26.67	10.33	12.13	8.82
Merrill Lynch	Edge Select Aggressive
Merrill Lynch	12	84	16	0	22.95	9.88	12.05	8.80
Burton Malkiel	Mid-Fifties
Burton Malkiel	8	80	20	0	20.25	7.87	9.75	8.77
Burton Malkiel	Late Thirties to Early Forties
Burton Malkiel	8	85	15	0	21.87	8.53	10.43	8.75
Burton Malkiel	Mid-Twenties
Burton Malkiel	8	87	13	0	22.60	8.71	10.60	8.70
Betterment	Robo Advisor 90 Value Tilt
Betterment	11	90.1	9.9	0	26.64	9.65	11.36	8.69
Paul Farrell	Second Grader's Starter
Paul Farrell	3	90	10	0	22.70	10.25	12.33	8.69
Lyn Alden	Moderate Portfolio
Lyn Alden	8	75	20	5	21.09	8.59	10.10	8.64
Dedalo Invest	Dedalo Eleven
Dedalo Invest	9	80	20	0	21.62	9.09	11.20	8.59
Bill Bernstein	Sheltered Sam 80/20
Bill Bernstein	12	77.6	20	2.4	23.25	8.67	9.90	8.58`;

let lines = data.split('\n').map(l => l.trim()).filter(Boolean);
let output = [];
for (let i = 0; i < lines.length; i += 2) {
  let [author, name] = lines[i].split('\t');
  if(!name) { 
    const match = lines[i].match(/^(.+?)\s{2,}(.+)$/);
    if(match) {
        author = match[1]; name = match[2];
    }
  }
  let line2 = lines[i+1].split('\t');
  if(line2.length < 8) {
      // maybe split by space if tabs got lost
      line2 = lines[i+1].split(/\s+/);
  }
  // format: Author, ETFs, Stocks, Bonds, Comm, 1Y, 5Y, 10Y, 30Y
  // e.g. "-- Market Benchmark	1	100	0	0	34.14	16.44	22.06	14.10"
  output.push({
    name,
    author,
    etfs: parseFloat(line2[1]),
    stocks: parseFloat(line2[2]),
    bonds: parseFloat(line2[3]),
    comm: parseFloat(line2[4]),
    y1: parseFloat(line2[5]),
    y5: parseFloat(line2[6]),
    y10: parseFloat(line2[7]),
    y30: parseFloat(line2[8]),
    description: `A systematic strategy by ${author}.`
  });
}

const content = `export const lazyPortfolios = ${JSON.stringify(output, null, 2)};`;
fs.writeFileSync('src/components/pages/lazyPortfoliosData.ts', content);
