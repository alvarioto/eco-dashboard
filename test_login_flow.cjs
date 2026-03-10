const fs = require('fs');

async function testFlow() {
    try {
        console.log("1. Logging in...");
        const loginRes = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123' }) // We assume there's a user, or we'll get 401
        });
        
        const loginHeaders = [...loginRes.headers.entries()];
        const cookieHeader = loginHeaders.find(h => h[0].toLowerCase() === 'set-cookie');
        console.log("Login Cookie Set?:", cookieHeader ? cookieHeader[1] : "NO COOKIE RETURNED");
        console.log("Login HTTP Status:", loginRes.status);
        console.log("Login JSON:", await loginRes.json());
        
        if (!cookieHeader) {
            console.log("\n❌ NO COOKIE RECEIVED. The backend is configured improperly.");
            return;
        }
        
        const cookieStr = cookieHeader[1].split(';')[0];
        console.log("\n2. Fetching Profile with Cookie:", cookieStr);
        
        const profRes = await fetch('http://localhost:3000/api/get-user-profile', {
            headers: { 'Cookie': cookieStr }
        });
        
        console.log("Profile HTTP Status:", profRes.status);
        const data = await profRes.text();
        console.log("Profile Data:", data);
        
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testFlow();
