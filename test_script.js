const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const match = content.match(/\.reveal-on-scroll\s*{[^}]*}/);
console.log(match ? match[0] : "Not found");
const animMatch = content.match(/@keyframes\s+revealUp\s*{[^}]*}/);
console.log(animMatch ? animMatch[0] : "No animation found");
