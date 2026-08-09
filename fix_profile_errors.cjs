const fs = require('fs');

let content = fs.readFileSync('src/components/pages/Profile.tsx', 'utf8');

// Fix selectedOption issue in CustomSelect
content = content.replace(
  /const displayLabel = selectedOption \? selectedOption\.props\.children : "";/,
  `const selectedOption = options.find((opt) => opt.props.value === value);\n  const displayLabel = selectedOption ? selectedOption.props.children : "";`
);

// We need to ensure Check and ChevronDown are in lucide-react, without duplicates
content = content.replace(
  /import \{ CheckCircle, Check, ChevronDown, AlertTriangle, ChevronRight, Shield, Search, Download, Camera, LogIn, Settings, User, Lock, FileText, Save, Trash2, HelpCircle \} from 'lucide-react';/,
  `import { CheckCircle, Check, ChevronDown, AlertTriangle, ChevronRight, Shield, Search, Download, Camera, LogIn, Settings, User, Lock, FileText, Save, Trash2, HelpCircle } from 'lucide-react';`
);
content = content.replace(/import \{ CheckCircle, Check, ChevronDown, AlertTriangle, ChevronDown, /g, "import { CheckCircle, Check, ChevronDown, AlertTriangle, ");

// Just to make sure selectedOption is there, let's fix it more aggressively:
content = content.replace(/const options = ([\s\S]*?) as React\.ReactElement<any>\[\];\n\s*const displayLabel/m,
  `const options = $1 as React.ReactElement<any>[];\n  const selectedOption = options.find((opt) => opt.props.value === value);\n  const displayLabel`);

fs.writeFileSync('src/components/pages/Profile.tsx', content, 'utf8');
console.log("Fixed profile errors aggressively");
