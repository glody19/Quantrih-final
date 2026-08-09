const fs = require('fs');
let content = fs.readFileSync('src/components/Navigation.tsx', 'utf8');

// Hide profile settings when not logged in
// Replace the profile link logic to only show if currentUser exists
const oldSettingsLink = `{ path: '/profile', label: 'Account Settings', icon: Settings },`;
const newSettingsLink = `...(currentUser ? [{ path: '/profile', label: 'Account Settings', icon: Settings }] : []),`;

if (content.includes(oldSettingsLink)) {
  content = content.replace(oldSettingsLink, newSettingsLink);
  fs.writeFileSync('src/components/Navigation.tsx', content, 'utf8');
  console.log("Updated Navigation to hide Account Settings for guests");
}
