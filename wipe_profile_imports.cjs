const fs = require('fs');

// We have many duplicate imports at the top. Let's just find the very LAST set of imports and remove the preceding ones.
let content = fs.readFileSync('src/components/pages/Profile.tsx', 'utf8');

// Find the index of the last `import React`
const lastReactImportIndex = content.lastIndexOf("import React, {");

if (lastReactImportIndex !== -1) {
    content = content.substring(lastReactImportIndex);
    fs.writeFileSync('src/components/pages/Profile.tsx', content, 'utf8');
    console.log("Wiped preceding duplicate imports");
}
