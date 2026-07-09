const serverScript = require('fs').readFileSync('dist/server.cjs', 'utf-8');
const newScript = serverScript.replace(/const PORT\s*=\s*3000/, 'const PORT = 3001');
require('fs').writeFileSync('dist/server2.cjs', newScript);
