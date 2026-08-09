const fs = require('fs');
let content = fs.readFileSync('src/components/pages/Profile.tsx', 'utf8');

// The replace logic wiped out everything, let's fix it by manually rewriting the top of the file without regex
let original = fs.readFileSync('src/components/pages/Profile.tsx', 'utf8');
let defaultAvatarIndex = original.indexOf('const DEFAULT_AVATAR');

let newContent = `import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';\n\n` + original.substring(defaultAvatarIndex);

fs.writeFileSync('src/components/pages/Profile.tsx', newContent, 'utf8');
