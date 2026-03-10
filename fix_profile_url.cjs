const fs = require('fs');
let h = fs.readFileSync('dist/account-profile.html', 'utf8');

// Replace exact localhost absolute URLs with relative paths to avoid CORS issues
h = h.replace(/http:\/\/localhost:3000\/api\/get-user-profile/g, '/api/get-user-profile');
h = h.replace(/http:\/\/localhost:3000\/api\/update-user-profile/g, '/api/update-user-profile');

fs.writeFileSync('dist/account-profile.html', h);
console.log('✅ URLs fixed');
