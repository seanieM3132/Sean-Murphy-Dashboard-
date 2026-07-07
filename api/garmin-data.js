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

    // Fetch data in parallel — use available methods + custom endpoints
    const results = await Promise.allSettled([
      GC.getSleepData(today),
      GC.getHeartRate(today),
      GC.getSteps(today),
      GC.get(`/usersummary-service/usersummary/daily/${email}?calendarDate=${today}`),
      GC.get(`/userstats-service/stats/${email}?calendarDate=${today}`),
    ]);

    const sl = results[0].status === 'fulfilled' ? (results[0].value || {}) : {};
    const hr = results[1].status === 'fulfilled' ? (results[1].value || {}) : {};
    const steps = results[2].status === 'fulfilled' ? (results[2].value || {}) : {};
    const summary = results[3].status === 'fulfilled' ? (results[3].value || {}) : {};
    const stats = results[4].status === 'fulfilled' ? (results[4].value || {}) : {};

    // Body Battery from daily summary
    const bbVal = summary.bodyBatteryMostRecentValue
      || summary.currentBodyBattery
      || null;

    // Sleep stages (seconds → minutes)
    const sleepRem = sl.remSleepSeconds != null ? sl.remSleepSeconds / 60 : null;
    const sleepDeep = sl.deepSleepSeconds != null ? sl.deepSleepSeconds / 60 : null;
    const sleepLight = sl.lightSleepSeconds != null ? sl.lightSleepSeconds / 60 : null;
    const sleepAwake = sl.awakeSleepSeconds != null ? sl.awakeSleepSeconds / 60 : null;
    const sleepDuration = sl.sleepTimeSeconds != null ? sl.sleepTimeSeconds / 60 : null;

    // Sleep score
    const sleepScore = sl.overallSleepScore
      || (sl.sleepScores && sl.sleepScores.overall)
      || sl.sleepQualityScore
      || null;

    // HRV
    const hrvVal = (hr.hrvSummary && hr.hrvSummary.lastNightAvg)
      || hr.lastNightAvg
      || (sl.hrvData && sl.hrvData.lastNight)
      || summary.lastNightAvgHrv
      || null;

    // Steps — getSteps may return a number or an object
    const stepCount = typeof steps === 'number' ? steps
      : (steps.totalSteps || summary.totalSteps || 0);
    const stepGoal = summary.dailyStepGoal || 10000;

    const result = {
      bodyBattery: bbVal,
      sleepScore: sleepScore,
      sleepDurationMins: sleepDuration,
      sleepRem, sleepDeep, sleepLight, sleepAwake,
      avgStress: summary.averageStressLevel || summary.overallStressLevel || null,
      hrv: hrvVal,
      restingHR: hr.restingHeartRate || summary.restingHeartRate || null,
      spo2: summary.latestSpo2 || summary.averageSpo2 || null,
      respRate: sl.averageRespirationValue || sl.lowestRespirationValue || null,
      steps: stepCount,
      stepGoal: stepGoal,
      _debug: { sleepKeys: Object.keys(sl), hrKeys: Object.keys(hr), summaryKeys: Object.keys(summary), statsKeys: Object.keys(stats) },
    };

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Garmin data fetch failed: ' + (e.message || String(e)) });
  }
};
