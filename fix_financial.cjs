const fs = require('fs');
let content = fs.readFileSync('src/components/pages/FinancialModeling.tsx', 'utf8');

const isMarketOpenCode = `const isUSMarketOpen = () => {
    const d = new Date();
    const dayOptions = { timeZone: "America/New_York", weekday: "short" } as const;
    const dayString = new Intl.DateTimeFormat("en-US", dayOptions).format(d);
    if (dayString === "Sat" || dayString === "Sun") return false;

    const timeOptions = { timeZone: "America/New_York", hour: "numeric", minute: "numeric", hour12: false } as const;
    const timeString = new Intl.DateTimeFormat("en-US", timeOptions).format(d);
    const [hours, minutes] = timeString.split(":").map(Number);
    const time = hours * 100 + minutes;
    
    // Check holidays
    const dateOptions = { timeZone: "America/New_York", month: "2-digit", day: "2-digit" } as const;
    const md = new Intl.DateTimeFormat("en-US", dateOptions).format(d).replace("/", "-");
    const holidays = [
        "01-01", "01-15", "01-20", "02-19", "02-17", "03-29", "04-18",
        "05-27", "05-26", "06-19", "07-04", "09-02", "09-01", "11-28",
        "11-27", "12-25"
    ];
    if (holidays.includes(md)) return false;

    return time >= 930 && time <= 1600;
};`;

content = content.replace(/const isUSMarketOpen = \(\) => \{[\s\S]*?return time >= 1330 && time <= 2100;\s*\};/, isMarketOpenCode);

// We should also fix the condition that hides the Global button
content = content.replace(/\{\!\(\[0, 6\]\.includes\(new Date\(\)\.getDay\(\)\)\) && \(/g, '{isUSMarketOpen() && (');

fs.writeFileSync('src/components/pages/FinancialModeling.tsx', content);
