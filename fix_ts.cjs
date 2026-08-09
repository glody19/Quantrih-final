const fs = require('fs');

function fixCustomSelect(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(
    /const options = React\.Children\.toArray\(children\)\.filter\([\s\S]*?\);\n/m,
    `const options = React.Children.toArray(children).filter(
    (child): child is React.ReactElement => React.isValidElement(child) && child.type === 'option'
  ) as React.ReactElement<any>[];\n`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Fixed TS in " + filePath);
}

fixCustomSelect('src/components/profile/InvestorProfileForm.tsx');
fixCustomSelect('src/components/pages/Profile.tsx');
