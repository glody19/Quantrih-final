const fs = require('fs');
const content = fs.readFileSync('src/components/pages/Home.tsx', 'utf-8');
const fixed = content.replace(/  \);\n    <\/MobileZoomWrapper>\n  \);\n}/g, "      </div>\n    </MobileZoomWrapper>\n  );\n}").replace(/  \);\n    <\/MobileZoomWrapper>\n  \);\n}/g, "");
fs.writeFileSync('src/components/pages/Home.tsx', fixed);
