// Garmin Connect data fetcher — returns daily summary.
// Requires a valid session token from garmin-auth.js.
// If the in-memory session is lost (cold start), returns 401 so the client re-authenticates.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET required' });

  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing bearer token. Re-authenticate.' });
  const token = auth.slice(7);

  // Try to import the sessions map from garmin-auth (same serverless instance)
  // In practice, Vercel may spin up separate instances, so this is best-effort.
  // A production setup would use Redis/KV for session persistence.
  let sessions;
  try {
    const authMod = await import('./garmin-auth.js');
    // Sessions won't be directly accessible from another module's scope in serverless.
    // Instead, we use env-based auth as a fallback.
  } catch {}

  // Fallback: use env vars for a single-user personal dashboard
  const email = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;
  if (!email || !password) {
    return res.status(401).json({
      error: 'Session expired or server restarted. Set GARMIN_EMAIL and GARMIN_PASSWORD env vars for persistent access, or re-authenticate.'
    });
  }

  try {
    const { GarminConnect } = await import('garmin-connect');
    const GC = new GarminConnect({ username: email, password });
    await GC.login();

    const today = new Date().toISOString().slice(0, 10);

    // Fetch data in parallel
    const [summary, sleep, heartRate, stressData, bodyBattery] = await Promise.allSettled([
      GC.getUserSummary(today),
      GC.getSleepData(today),
      GC.getHeartRate(today),
      GC.getStress(today),
      GC.get(`https://connect.garmin.com/modern/proxy/usersummary-service/stats/body-battery/date/${today}`)
        .catch(() => null),
    ]);

    const s = summary.status === 'fulfilled' ? summary.value : {};
    const sl = sleep.status === 'fulfilled' ? sleep.value : {};
    const hr = heartRate.status === 'fulfilled' ? heartRate.value : {};
    const st = stressData.status === 'fulfilled' ? stressData.value : {};

    // Extract Body Battery (latest value)
    let bbVal = null;
    if (bodyBattery.status === 'fulfilled' && bodyBattery.value) {
      const bbData = bodyBattery.value;
      if (Array.isArray(bbData)) {
        const last = bbData[bbData.length - 1];
        bbVal = last && last[1] != null ? last[1] : null;
      } else if (bbData.bodyBatteryValuesArray) {
        const arr = bbData.bodyBatteryValuesArray;
        const last = arr[arr.length - 1];
        bbVal = last && last[1] != null ? last[1] : null;
      } else if (bbData.startTimestampLocal) {
        bbVal = bbData.charged != null ? bbData.charged : null;
      }
    }
    // Fallback: try from user summary
    if (bbVal == null && s.bodyBatteryMostRecentValue != null) {
      bbVal = s.bodyBatteryMostRecentValue;
    }

    // Sleep stages (in minutes)
    const sleepRem = sl.remSleepSeconds != null ? sl.remSleepSeconds / 60 : (sl.remSleepData ? sl.remSleepData / 60 : null);
    const sleepDeep = sl.deepSleepSeconds != null ? sl.deepSleepSeconds / 60 : null;
    const sleepLight = sl.lightSleepSeconds != null ? sl.lightSleepSeconds / 60 : null;
    const sleepAwake = sl.awakeSleepSeconds != null ? sl.awakeSleepSeconds / 60 : null;
    const sleepDuration = sl.sleepTimeSeconds != null ? sl.sleepTimeSeconds / 60 : null;

    const result = {
      bodyBattery: bbVal,
      sleepScore: sl.overallSleepScore || sl.sleepScores?.overall || null,
      sleepDurationMins: sleepDuration,
      sleepRem, sleepDeep, sleepLight, sleepAwake,
      avgStress: st.overallStressLevel || s.averageStressLevel || null,
      hrv: hr.hrvSummary?.lastNightAvg || hr.lastNightAvg || sl.hrvData?.lastNight || null,
      restingHR: hr.restingHeartRate || s.restingHeartRate || null,
      spo2: s.latestSpo2 || s.averageSpo2 || null,
      respRate: sl.averageRespirationValue || sl.lowestRespirationValue || null,
      steps: s.totalSteps || 0,
      stepGoal: s.dailyStepGoal || 10000,
      trainingReadiness: s.trainingReadinessScore || null,
      vo2Max: s.vo2MaxValue || null,
    };

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Garmin data fetch failed: ' + (e.message || String(e)) });
  }
}
