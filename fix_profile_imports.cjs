const fs = require('fs');
let content = fs.readFileSync('src/components/pages/Profile.tsx', 'utf8');

// The lines look like this:
// import {
//   signOut,
//   ...
//   EmailAuthProvider
// } from 'firebase/auth';
// import { import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
// import { import { motion, AnimatePresence } from 'motion/react';

content = content.replace(/import \{\n\s*signOut,[\s\S]*?EmailAuthProvider\n\}\s*from 'firebase\/auth';\nimport \{\s*import\s*\{\s*doc,\s*getDoc/m, 
`import {
  signOut,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';`);

content = content.replace(/import\s*\{\s*import\s*\{\s*motion,\s*AnimatePresence\s*\}\s*from\s*'motion\/react';/, 
`import { motion, AnimatePresence } from 'motion/react';`);

content = content.replace(/import \{ User, Settings, Lock, FileText, ChevronRight, Save, Trash2, Camera, Shield, HelpCircle \}/,
`import { User, Settings, Lock, FileText, ChevronRight, Save, Trash2, Camera, Shield, HelpCircle, ChevronDown, Check }`);

fs.writeFileSync('src/components/pages/Profile.tsx', content);
console.log("Fixed imports");
