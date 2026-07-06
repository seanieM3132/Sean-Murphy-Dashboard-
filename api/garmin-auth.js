// Garmin Connect authentication via garmin-connect package.
// Deploy on Vercel. User provides credentials via POST body.
// Returns a simple token; for persistent access set GARMIN_EMAIL + GARMIN_PASSWORD env vars.

const { GarminConnect } = require('garmin-connect');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  const email = (body && body.email) || process.env.GARMIN_EMAIL || '';
  const password = (body && body.password) || process.env.GARMIN_PASSWORD || '';
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const GC = new GarminConnect({
      username: email,
      password: password,
    });
    await GC.login();

    // Generate a simple session token
    const token = Buffer.from(email + ':' + Date.now() + ':' + Math.random()).toString('base64url');

    return res.status(200).json({ token, email });
  } catch (e) {
    return res.status(401).json({ error: 'Garmin login failed: ' + (e.message || String(e)) });
  }
};
