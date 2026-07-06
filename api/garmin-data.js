// Garmin Connect data fetcher — returns daily summary.
// Requires GARMIN_EMAIL and GARMIN_PASSWORD env vars set in Vercel.

const { GarminConnect } = require('garmin-connect');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET required' });

  const email = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;
  if (!email || !password) {
    return res.status(500).json({
      error: 'GARMIN_EMAIL and GARMIN_PASSWORD env vars are not set in Vercel.'
    });
  }

  try {
    const GC = new GarminConnect({ username: email, password });
    await GC.login();

    const today = new Date().toISOString().slice(0, 10);

    // Fetch data in parallel
    const results = await Promise.allSettled([
      GC.getUserSummary(today),
      GC.getSleepData(today),
      GC.getHeartRate(today),
      GC.getStress(today),
    ]);

    const s = results[0].status === 'fulfilled' ? (results[0].value || {}) : {};
    const sl = results[1].status === 'fulfilled' ? (results[1].value || {}) : {};
    const hr = results[2].status === 'fulfilled' ? (results[2].value || {}) : {};
    const st = results[3].status === 'fulfilled' ? (results[3].value || {}) : {};

    // Body Battery from user summary
    const bbVal = s.bodyBatteryMostRecentValue != null ? s.bodyBatteryMostRecentValue : null;

    // Sleep stages (seconds → minutes)
    const sleepRem = sl.remSleepSeconds != null ? sl.remSleepSeconds / 60 : null;
    const sleepDeep = sl.deepSleepSeconds != null ? sl.deepSleepSeconds / 60 : null;
    const sleepLight = sl.lightSleepSeconds != null ? sl.lightSleepSeconds / 60 : null;
    const sleepAwake = sl.awakeSleepSeconds != null ? sl.awakeSleepSeconds / 60 : null;
    const sleepDuration = sl.sleepTimeSeconds != null ? sl.sleepTimeSeconds / 60 : null;

    // Sleep score — try multiple possible fields
    const sleepScore = sl.overallSleepScore
      || (sl.sleepScores && sl.sleepScores.overall)
      || sl.sleepQualityScore
      || null;

    // HRV — try multiple possible locations
    const hrvVal = (hr.hrvSummary && hr.hrvSummary.lastNightAvg)
      || hr.lastNightAvg
      || (sl.hrvData && sl.hrvData.lastNight)
      || s.lastNightAvgHrv
      || null;

    const result = {
      bodyBattery: bbVal,
      sleepScore: sleepScore,
      sleepDurationMins: sleepDuration,
      sleepRem, sleepDeep, sleepLight, sleepAwake,
      avgStress: st.overallStressLevel || s.averageStressLevel || null,
      hrv: hrvVal,
      restingHR: hr.restingHeartRate || s.restingHeartRate || null,
      spo2: s.latestSpo2 || s.averageSpo2 || null,
      respRate: sl.averageRespirationValue || sl.lowestRespirationValue || null,
      steps: s.totalSteps || 0,
      stepGoal: s.dailyStepGoal || 10000,
    };

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Garmin data fetch failed: ' + (e.message || String(e)) });
  }
};
