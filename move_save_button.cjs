const fs = require('fs');
let content = fs.readFileSync('src/components/profile/InvestorProfileForm.tsx', 'utf8');

// The original save button is likely at the bottom.
// Let's find it using a more robust regex or string manipulation.
const saveButtonRegex = /<div className="flex justify-end pt-6 border-t border-zinc-800\/50">[\s\S]*?<\/button>\s*<\/div>/;

if (content.match(saveButtonRegex)) {
  content = content.replace(saveButtonRegex, '');
} else {
  // Try another pattern
  const backupRegex = /<div className="flex justify-end pt-6[^>]*>[\s\S]*?<\/button>\s*<\/div>/;
  content = content.replace(backupRegex, '');
}

// Find header
const headerPattern = /<div className="flex items-center justify-between mb-8">\s*<div>\s*<h2 className="text-2xl font-bold text-blue-400 drop-shadow-md">Investor Profile<\/h2>\s*<p className="text-zinc-400 mt-1">\s*Customize your investment preferences and goals.\s*<\/p>\s*<\/div>\s*<\/div>/;

const newHeader = `
<div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
  <div>
    <h2 className="text-2xl font-bold text-blue-400 drop-shadow-md">Investor Profile</h2>
    <p className="text-zinc-400 mt-1">
      Customize your investment preferences and goals.
    </p>
  </div>
  <div className="flex flex-col items-end gap-2">
     <button
      type="submit"
      disabled={saving}
      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full hover:scale-[1.02] transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:hover:scale-100"
    >
      {saving ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Save className="w-5 h-5" />
      )}
      <span>{saving ? 'Saving...' : 'Save Profile'}</span>
    </button>
    {lastSavedTime && (
      <span className="text-xs text-zinc-500 flex items-center">
        <Check className="w-3 h-3 mr-1 text-emerald-500" />
        Last saved to cloud: {lastSavedTime}
      </span>
    )}
  </div>
</div>
`;

content = content.replace(headerPattern, newHeader);

fs.writeFileSync('src/components/profile/InvestorProfileForm.tsx', content, 'utf8');
console.log("Moved save button to top");
