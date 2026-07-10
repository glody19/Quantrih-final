const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Regular expression to match: language === 'fr' ? "French string" : "English string"
    // Handle both single and double quotes, and template literals
    
    // Simplest approach: run a loop trying to find `language === 'fr' ? X : Y` and replace with Y.
    // Since AST parsing is hard, we can use a robust regex or just string replacement if we are careful.
    
    // It's safer to just change the LanguageContext and remove the language toggle.
    // The user said "supprime les français, chaque test qui est français mets le en anglais definitive".
    // I can do a regex: /language\s*===\s*['"]fr['"]\s*\?\s*(['"`].*?['"`])\s*:\s*(['"`].*?['"`])/g
    // But this might fail on nested ternaries or if there are variables.
    
    // Alternatively, I can just replace `language === 'fr'` with `false` globally!
    // If `language === 'fr'` is always evaluated to `false`, then the English side of the ternary is always used.
    // Example: `false ? 'Bonjour' : 'Hello'`
    // Wait, the user said "mets le en anglais definitive", meaning get rid of the code.
    
    // Let's try the regex to see what it replaces.
    const regex1 = /language\s*===\s*['"]fr['"]\s*\?\s*['"`](?:[^'"`\\]|\\.)*['"`]\s*:\s*(['"`](?:[^'"`\\]|\\.)*['"`])/g;
    const newContent = content.replace(regex1, '$1');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated:', file);
    }
});
