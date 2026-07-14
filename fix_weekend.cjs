const fs = require('fs');
let content = fs.readFileSync('src/components/pages/FinancialModeling.tsx', 'utf8');

const isWeekendCode = `const isWeekend = () => {
    const d = new Date();
    const dayOptions = { timeZone: "America/New_York", weekday: "short" } as const;
    const dayString = new Intl.DateTimeFormat("en-US", dayOptions).format(d);
    return dayString === "Sat" || dayString === "Sun";
};

const isUSMarketOpen = () => {`;

content = content.replace(/const isUSMarketOpen = \(\) => \{/g, isWeekendCode);
content = content.replace(/\{isUSMarketOpen\(\) && \(/g, '{!isWeekend() && (');

// Also update initial state to check if it's weekend, not if market is open
content = content.replace(/const \[marqueeMode, setMarqueeMode\] = useState<'stocks' \| 'crypto'>\(isUSMarketOpen\(\) \? 'stocks' : 'crypto'\);/g, "const [marqueeMode, setMarqueeMode] = useState<'stocks' | 'crypto'>(!isWeekend() ? 'stocks' : 'crypto');");

fs.writeFileSync('src/components/pages/FinancialModeling.tsx', content);
