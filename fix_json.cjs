const fs = require('fs');
let content = fs.readFileSync('public/factoresdeemision.json', 'utf8');

// Fix trailing commas
content = content.replace(/,(\s*[}\]])/g, '$1');

// Fix missing comma between closing brace/bracket and next key String
content = content.replace(/([\}])(\s*)"([^"]+)"\s*:/g, '$1,$2"$3":');

// Fix missing comma between string/number value and next key
content = content.replace(/([0-9"a-zA-Z])(\s*\n\s*)"([^"]+)"\s*:/g, '$1,$2"$3":');

// Fix "key" = { 
content = content.replace(/"([^"]+)"\s*=\s*\{/g, '},$1"$1": {');

// Try a loop or just replace all instances of "key" = {
content = content.replace(/"([^"]+)"\s*=\s*\{/g, '"$1": {');
content = content.replace(/\}[\s]*"([a-zA-Z\s]+)"\s*=\s*\{/g, '},\n\t"$1": {');

// Because of nesting, if "factores emision por gases" appears after a '}', it should have a comma.
// Let's just blindly force a comma if there's a } before it
content = content.replace(/\}(\s*)"factores emision por gases"(\s*)[=:](\s*)\{/g, '},$1"factores emision por gases": {');


try {
    JSON.parse(content);
    fs.writeFileSync('public/factoresdeemision.json', content);
    console.log("JSON fixed and parsed successfully.");
} catch (e) {
    console.log("Still failing to parse: " + e.message);
    fs.writeFileSync('public/factoresdeemision.json', content);
}
