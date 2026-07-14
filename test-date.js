const now = new Date();
const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
console.log(nyTime.getDay(), nyTime.getHours(), nyTime.getMinutes());
