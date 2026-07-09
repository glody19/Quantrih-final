const https = require('https');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const url = 'https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/F-F_Research_Data_Factors_CSV.zip';
const destPath = path.join(__dirname, '..', 'public', 'data');
const zipPath = path.join(__dirname, '..', 'ff.zip');

if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath, { recursive: true });
}

const file = fs.createWriteStream(zipPath);

console.log('Downloading Fama-French data...');

https.get(url, (response) => {
  if (response.statusCode === 301 || response.statusCode === 302) {
    // Follow redirect if there is one
    https.get(response.headers.location, processResponse);
  } else {
    processResponse(response);
  }
}).on('error', (err) => {
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  console.error('Download error:', err);
});

function processResponse(response) {
  response.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log('Download complete, extracting...');
      try {
        const zip = new AdmZip(zipPath);
        const zipEntries = zip.getEntries(); 
        const csvEntry = zipEntries.find(entry => entry.entryName.toUpperCase().endsWith('.CSV'));
        
        if (csvEntry) {
          const csvRaw = zip.readAsText(csvEntry);
          const lines = csvRaw.split('\n');
          let cleanLines = ['Date,Mkt-RF,SMB,HML,RF'];
          let rowsFound = 0;
          
          for (let line of lines) {
            line = line.trim();
            // Match the YYYYMM format accurately
            const match = line.match(/^"?(\d{6})"?\s*,(.*)$/);
            if (match) {
              cleanLines.push(`${match[1]},${match[2]}`);
              rowsFound++;
            }
          }

          const outPath = path.join(destPath, 'fama_french.csv');
          fs.writeFileSync(outPath, cleanLines.join('\n'));
          console.log(`Success: Cleaned CSV written with ${rowsFound} monthly rows to ${outPath}`);
        } else {
          console.error('No CSV file found inside the zip.');
        }
      } catch (e) {
        console.error('Extraction error:', e);
      } finally {
        if (fs.existsSync(zipPath)) {
          fs.unlinkSync(zipPath);
        }
      }
    });
  });
}
