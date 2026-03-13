const http = require('http');

const loginData = JSON.stringify({
  username: 'alvaro', // Assuming the user's username is something we can guess. Wait, no need to guess if we can just query the DB! But we don't have the password.
});

// Actually, let's just use `fetch` if Node >= 18.
async function run() {
  try {
    // We can just try to see what `add-building` returned without login. Oh wait, it returns 302 redirect.
    console.log("We need a session cookie. I'll read app.js to find the exact code.");
  } catch(e) {
    console.error(e);
  }
}
run();
