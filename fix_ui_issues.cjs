const fs = require('fs');

// Fix InvestorProfileForm
let investorContent = fs.readFileSync('src/components/profile/InvestorProfileForm.tsx', 'utf8');

// The card background needs to be more visible, currently it's likely bg-zinc-900/50 backdrop-blur-md or similar.
// Let's make it a solid darker background with a subtle border for better contrast.
investorContent = investorContent.replace(/bg-zinc-900\/50 backdrop-blur-xl border-zinc-800\/50/g, 'bg-zinc-900/90 backdrop-blur-2xl border-zinc-700 shadow-2xl');
investorContent = investorContent.replace(/bg-zinc-900\/80 backdrop-blur-xl/g, 'bg-zinc-900/90 backdrop-blur-2xl border-zinc-700 shadow-2xl');

// Make the titles more visible (e.g. from text-white to a bright color or just ensure they are bright)
investorContent = investorContent.replace(/text-2xl font-bold text-white/g, 'text-2xl font-bold text-blue-400 drop-shadow-md');
investorContent = investorContent.replace(/text-xl font-bold text-white/g, 'text-xl font-bold text-blue-400 drop-shadow-md');


fs.writeFileSync('src/components/profile/InvestorProfileForm.tsx', investorContent, 'utf8');

// Fix Profile
let profileContent = fs.readFileSync('src/components/pages/Profile.tsx', 'utf8');

// Improve background visibility
profileContent = profileContent.replace(/bg-zinc-900\/50 backdrop-blur-xl border-zinc-800\/50/g, 'bg-zinc-900/90 backdrop-blur-2xl border-zinc-700 shadow-2xl');
profileContent = profileContent.replace(/bg-zinc-900\/80 backdrop-blur-xl/g, 'bg-zinc-900/90 backdrop-blur-2xl border-zinc-700 shadow-2xl');

// Improve title visibility
profileContent = profileContent.replace(/text-3xl font-bold text-white/g, 'text-3xl font-bold text-blue-400 drop-shadow-md');
profileContent = profileContent.replace(/text-2xl font-bold text-white/g, 'text-2xl font-bold text-blue-400 drop-shadow-md');

fs.writeFileSync('src/components/pages/Profile.tsx', profileContent, 'utf8');

console.log("Updated UI background and title colors");
