const fs = require('fs');
let content = fs.readFileSync('src/components/pages/Market.tsx', 'utf8');

const newCheckMarketStatus = `    const checkMarketStatus = () => {
      const now = new Date();
      
      const dayOptions = { timeZone: "America/New_York", weekday: "short" } as const;
      const dayString = new Intl.DateTimeFormat("en-US", dayOptions).format(now);
      
      const timeOptions = { timeZone: "America/New_York", hour: "numeric", minute: "numeric", hour12: false } as const;
      const timeString = new Intl.DateTimeFormat("en-US", timeOptions).format(now);
      const [hours, minutes] = timeString.split(":").map(Number);
      
      // Check if it's weekend
      if (dayString === "Sat" || dayString === "Sun") {
        setIsWeekend(true);
        setIsMarketOpen(false);
        return;
      }
      setIsWeekend(false);

      // US Market holidays (simplified for 2024-2026, can be extended)
      const dateOptions = { timeZone: "America/New_York", month: "2-digit", day: "2-digit" } as const;
      const dateString = new Intl.DateTimeFormat("en-US", dateOptions).format(now);
      const md = dateString.replace("/", "-");

      const holidays = [
        "01-01", "01-15", "01-20", "02-19", "02-17", "03-29", "04-18",
        "05-27", "05-26", "06-19", "07-04", "09-02", "09-01", "11-28",
        "11-27", "12-25"
      ];

      if (holidays.includes(md)) {
        setIsWeekend(true);
        setIsMarketOpen(false);
        return;
      }

      const isPastOpen = hours > 9 || (hours === 9 && minutes >= 30);
      const isBeforeClose = hours < 16;
      
      setIsMarketOpen(isPastOpen && isBeforeClose);
    };`;

content = content.replace(/const checkMarketStatus = \(\) => \{[\s\S]*?setIsMarketOpen\(isPastOpen && isBeforeClose\);\s*\};\s*/, newCheckMarketStatus + '\n\n');

fs.writeFileSync('src/components/pages/Market.tsx', content);
