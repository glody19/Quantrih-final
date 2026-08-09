const fs = require('fs');

let content = fs.readFileSync('src/components/pages/Profile.tsx', 'utf8');

content = `import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { auth, db, serverTimestamp } from '../../firebase';
import {
  signOut,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { countries, Country } from '../../data/countries';
import { InvestorProfileForm } from '../profile/InvestorProfileForm';
import {
  CheckCircle, Check, ChevronDown, AlertTriangle, ChevronRight, Shield, Search, Download, Camera, LogIn, Settings, User, Lock, FileText, Save, Trash2, HelpCircle, ArrowLeft, Mail, Briefcase, LogOut
} from 'lucide-react';
` + content.substring(content.indexOf('const DEFAULT_AVATAR'));

content = content.replace(/import {.*?} from 'lucide-react';/g, ''); // Remove any old imports that might be stuck
content = content.replace(/import {.*?} from 'firebase\/auth';/g, '');
content = content.replace(/import {.*?} from 'firebase\/firestore';/g, '');
content = content.replace(/import {.*?} from 'motion\/react';/g, '');

fs.writeFileSync('src/components/pages/Profile.tsx', content, 'utf8');
console.log("Fixed all profile imports");
