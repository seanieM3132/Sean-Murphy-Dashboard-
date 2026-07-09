// Generate a Garmin Connect session token.
// POST with { email, password } or uses GARMIN_EMAIL/GARMIN_PASSWORD env vars.
// Returns the token JSON — set it as GARMIN_TOKEN env var in Vercel for persistent auth.

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
    const GC = new GarminConnect({ username: email, password });
    await GC.login();
    const token = await GC.exportToken();

    return res.status(200).json({
      success: true,
      token,
      tokenString: JSON.stringify(token),
      instructions: 'Copy the tokenString value and set it as GARMIN_TOKEN in your Vercel environment variables.'
    });
  } catch (e) {
    return res.status(401).json({ error: 'Garmin login failed: ' + (e.message || String(e)) });
  }
};
