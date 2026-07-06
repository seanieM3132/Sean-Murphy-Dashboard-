// Garmin Connect authentication via garmin-connect package.
// Deploy on Vercel. Set env vars: (none required — user provides credentials via POST body)
// The session token is returned to the client and stored in localStorage.
// On subsequent requests, the token is passed as a Bearer header to garmin-data.js.

import GarminConnect from 'garmin-connect';

// In-memory session cache (survives within a single serverless instance)
const sessions = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  const { email, password } = body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const GC = new GarminConnect.GarminConnect({
      username: email,
      password: password,
    });
    await GC.login();

    // Generate a simple session token and cache the GC instance
    const token = Buffer.from(email + ':' + Date.now() + ':' + Math.random()).toString('base64url');
    sessions.set(token, { gc: GC, email, ts: Date.now() });

    // Clean old sessions (keep max 50)
    if (sessions.size > 50) {
      const oldest = [...sessions.entries()].sort((a, b) => a[1].ts - b[1].ts);
      for (let i = 0; i < oldest.length - 50; i++) sessions.delete(oldest[i][0]);
    }

    return res.status(200).json({ token, email });
  } catch (e) {
    return res.status(401).json({ error: 'Garmin login failed: ' + (e.message || String(e)) });
  }
}
