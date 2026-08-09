const fs = require('fs');

// Profile.tsx
let profileContent = fs.readFileSync('src/components/pages/Profile.tsx', 'utf8');

// Import CustomSelect
if (!profileContent.includes("import { CustomSelect } from '../ui/CustomSelect';")) {
  profileContent = profileContent.replace("import { InvestorProfileForm } from '../profile/InvestorProfileForm';", "import { InvestorProfileForm } from '../profile/InvestorProfileForm';\nimport { CustomSelect } from '../ui/CustomSelect';");
}

// Remove the inline CustomSelect
profileContent = profileContent.replace(/const CustomSelect = \([\s\S]*?\}\s*<\/\w+>\s*\n  \);\n\};\n/g, "");

fs.writeFileSync('src/components/pages/Profile.tsx', profileContent, 'utf8');

// InvestorProfileForm.tsx
let investorContent = fs.readFileSync('src/components/profile/InvestorProfileForm.tsx', 'utf8');

// Import CustomSelect
if (!investorContent.includes("import { CustomSelect } from '../ui/CustomSelect';")) {
  investorContent = investorContent.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { CustomSelect } from '../ui/CustomSelect';");
}

// Replace all <select ...> with <CustomSelect ...>
investorContent = investorContent.replace(/<select/g, "<CustomSelect");
investorContent = investorContent.replace(/<\/select>/g, "</CustomSelect>");

fs.writeFileSync('src/components/profile/InvestorProfileForm.tsx', investorContent, 'utf8');

console.log("Extracted CustomSelect and applied to forms");
