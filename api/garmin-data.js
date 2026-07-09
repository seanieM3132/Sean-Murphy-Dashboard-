// Garmin Connect data fetcher — returns comprehensive Forerunner 265 data.
// Requires GARMIN_EMAIL and GARMIN_PASSWORD env vars.
// Optionally set GARMIN_TOKEN (JSON string from exportToken) for session persistence.

const { GarminConnect } = require('garmin-connect');

// In-memory token cache for warm Vercel instances
let tokenCache = null;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET required' });

  const email = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;
  if (!email || !password) {
    return res.status(500).json({ error: 'GARMIN_EMAIL and GARMIN_PASSWORD env vars required.' });
  }

  let GC;
  try {
    GC = new GarminConnect({ username: email, password });

    // Try token-based auth first (avoids login/CAPTCHA issues)
    let loggedIn = false;

    // 1. Try in-memory cached token (warm instance)
    if (tokenCache) {
      try {
        await GC.loadToken(tokenCache);
        // Verify the token works with a lightweight call
        await GC.getUserProfile();
        loggedIn = true;
      } catch (e) {
        tokenCache = null;
      }
    }

    // 2. Try env var token (cold start)
    if (!loggedIn && process.env.GARMIN_TOKEN) {
      try {
        const envToken = JSON.parse(process.env.GARMIN_TOKEN);
        await GC.loadToken(envToken);
        await GC.getUserProfile();
        loggedIn = true;
        tokenCache = envToken;
      } catch (e) {
        // Token expired, fall through to login
      }
    }

    // 3. Fall back to username/password login
    if (!loggedIn) {
      await GC.login();
      loggedIn = true;
      // Cache the new token
      try {
        tokenCache = await GC.exportToken();
      } catch (e) {}
    }
  } catch (e) {
    return res.status(401).json({
      error: 'Garmin auth failed: ' + (e.message || String(e)),
      hint: 'Run the /api/garmin-token endpoint to generate a fresh session token, then set GARMIN_TOKEN env var in Vercel.'
    });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Fetch everything the Forerunner 265 provides — in parallel
    const results = await Promise.allSettled([
      GC.getSleepData(today),                                                               // 0: sleep
      GC.getHeartRate(today),                                                                // 1: heart rate
      GC.getSteps(today),                                                                    // 2: steps
      GC.get('/usersummary-service/usersummary/daily/' + email + '?calendarDate=' + today),  // 3: daily summary
      safeGet(GC, '/hrv-service/hrv/' + today),                                              // 4: HRV detailed
      safeGet(GC, '/wellness-service/wellness/bodyBattery/dates/' + yesterday + '/' + today), // 5: body battery timeline
      safeGet(GC, '/wellness-service/wellness/dailyStress/' + today),                        // 6: stress timeline
      safeGet(GC, '/metrics-service/metrics/maxmet/daily/' + yesterday + '/' + today),       // 7: VO2 max
      safeGet(GC, '/fitnessstats-service/activity?aggregation=weekly&startDate=' + today + '&endDate=' + today), // 8: training load
      safeGet(GC, '/proxy/activity-service/activity/lastActivities/5'),                      // 9: recent activities
      safeGet(GC, '/wellness-service/wellness/dailySleep/nightly/' + today + '/' + today),   // 10: nightly sleep detail
      GC.getDailyHydration(today),                                                           // 11: hydration
      safeGet(GC, '/respiration-service/respiration/daily/' + today + '/' + today),          // 12: respiration
    ]);

    const val = (i) => results[i].status === 'fulfilled' ? (results[i].value || {}) : {};

    const sl = val(0);
    const hr = val(1);
    const steps = val(2);
    const summary = val(3);
    const hrvData = val(4);
    const bbTimeline = val(5);
    const stressData = val(6);
    const vo2Data = val(7);
    const trainingLoad = val(8);
    const recentActivities = val(9);
    const nightlySleep = val(10);
    const hydration = val(11);
    const respData = val(12);

    // --- Body Battery ---
    const bbVal = summary.bodyBatteryMostRecentValue
      || summary.currentBodyBattery
      || null;
    const bbHigh = summary.bodyBatteryHighestValue || null;
    const bbLow = summary.bodyBatteryLowestValue || null;
    // Body battery charged/drained
    const bbCharged = (bbHigh != null && bbLow != null) ? bbHigh - bbLow : null;

    // --- Sleep ---
    const sleepRem = sl.remSleepSeconds != null ? sl.remSleepSeconds / 60 : null;
    const sleepDeep = sl.deepSleepSeconds != null ? sl.deepSleepSeconds / 60 : null;
    const sleepLight = sl.lightSleepSeconds != null ? sl.lightSleepSeconds / 60 : null;
    const sleepAwake = sl.awakeSleepSeconds != null ? sl.awakeSleepSeconds / 60 : null;
    const sleepDuration = sl.sleepTimeSeconds != null ? sl.sleepTimeSeconds / 60 : null;
    const sleepScore = sl.overallSleepScore
      || (sl.sleepScores && sl.sleepScores.overall)
      || sl.sleepQualityScore
      || null;
    const sleepStart = sl.sleepStartTimestampLocal || sl.sleepStartTimestampGMT || null;
    const sleepEnd = sl.sleepEndTimestampLocal || sl.sleepEndTimestampGMT || null;
    const sleepNeed = sl.sleepNeed || sl.sleepNeedSeconds ? (sl.sleepNeedSeconds || sl.sleepNeed) / 60 : null;
    // Nightly HRV from sleep
    const nightlyHRV = sl.startOfNightHRV || (sl.hrvData && sl.hrvData.startOfNight) || null;

    // --- HRV ---
    const hrvVal = (hrvData.hrvSummary && hrvData.hrvSummary.lastNightAvg)
      || (hr.hrvSummary && hr.hrvSummary.lastNightAvg)
      || hr.lastNightAvg
      || (sl.hrvData && sl.hrvData.lastNight)
      || summary.lastNightAvgHrv
      || null;
    const hrvWeeklyAvg = (hrvData.hrvSummary && hrvData.hrvSummary.weeklyAvg)
      || summary.weeklyAvgHrv
      || null;
    const hrvStatus = (hrvData.hrvSummary && hrvData.hrvSummary.status)
      || summary.hrvStatus
      || null;
    const hrvBaseline = (hrvData.hrvSummary && hrvData.hrvSummary.baseline)
      || null;

    // --- Heart Rate ---
    const rhr = hr.restingHeartRate || summary.restingHeartRate || null;
    const hrMin = hr.minHeartRate || summary.minHeartRate || null;
    const hrMax = hr.maxHeartRate || summary.maxHeartRate || null;
    const hrCurrent = summary.lastSevenDaysAvgRestingHeartRate || null;
    const hr7DayAvg = summary.lastSevenDaysAvgRestingHeartRate || null;

    // --- SpO2 ---
    const spo2 = summary.latestSpo2 || summary.averageSpo2 || null;
    const spo2Avg = summary.averageSpo2 || null;
    const spo2Low = summary.lowestSpo2 || null;

    // --- Respiration ---
    const respRate = sl.averageRespirationValue || summary.averageRespirationValue || null;
    const respSleep = sl.lowestRespirationValue || null;
    const respHigh = summary.highestRespirationValue || null;
    const respLow = summary.lowestRespirationValue || sl.lowestRespirationValue || null;

    // --- Stress ---
    const avgStress = summary.averageStressLevel || summary.overallStressLevel || null;
    const maxStress = summary.maxStressLevel || null;
    const stressDuration = summary.highStressDuration || null;
    const restStressDuration = summary.restStressDuration || null;
    const lowStressDuration = summary.lowStressDuration || null;
    const medStressDuration = summary.mediumStressDuration || null;

    // --- Steps & Activity ---
    const stepCount = typeof steps === 'number' ? steps : (steps.totalSteps || summary.totalSteps || 0);
    const stepGoal = summary.dailyStepGoal || 10000;
    const totalCalories = summary.totalKilocalories || null;
    const activeCalories = summary.activeKilocalories || null;
    const bmrCalories = summary.bmrKilocalories || null;
    const floorsClimbed = summary.floorsAscended || null;
    const floorsGoal = summary.floorsAscendedGoal || null;
    const intenseMins = summary.intensityMinutesGoal || null;
    const moderateMins = summary.moderateIntensityMinutes || null;
    const vigorousMins = summary.vigorousIntensityMinutes || null;
    const totalDistance = summary.totalDistanceMeters || null;
    const activeMinutes = summary.activeTimeInMs ? Math.round(summary.activeTimeInMs / 60000) : null;

    // --- VO2 Max ---
    let vo2Max = null;
    let vo2MaxRunning = null;
    if (vo2Data && Array.isArray(vo2Data)) {
      const latest = vo2Data[vo2Data.length - 1];
      if (latest) {
        vo2Max = latest.generic || latest.vo2MaxValue || null;
        vo2MaxRunning = latest.running || null;
      }
    } else if (vo2Data) {
      vo2Max = vo2Data.generic || vo2Data.vo2MaxValue || null;
      vo2MaxRunning = vo2Data.running || null;
    }

    // --- Training Load ---
    let trainingLoadVal = null;
    let trainingStatus = null;
    if (trainingLoad) {
      trainingLoadVal = trainingLoad.totalTrainingLoad || trainingLoad.weeklyTrainingLoad || null;
      trainingStatus = trainingLoad.trainingStatus || trainingLoad.status || null;
    }

    // --- Recent Activities ---
    let activities = [];
    if (Array.isArray(recentActivities)) {
      activities = recentActivities.slice(0, 5).map(a => ({
        name: a.activityName || a.activityType?.typeKey || 'Activity',
        type: a.activityType?.typeKey || null,
        date: a.startTimeLocal || a.startTimeGMT || null,
        duration: a.duration ? Math.round(a.duration / 60) : null,
        distance: a.distance ? Math.round(a.distance) : null,
        calories: a.calories || null,
        avgHR: a.averageHR || null,
        maxHR: a.maxHR || null,
        trainingEffect: a.aerobicTrainingEffect || null,
        anaerobicEffect: a.anaerobicTrainingEffect || null,
        vo2MaxActivity: a.vO2MaxValue || null,
      }));
    }

    // --- Hydration ---
    const hydrationMl = hydration && hydration.valueInML != null ? hydration.valueInML : null;
    const hydrationGoal = hydration && hydration.goalInML != null ? hydration.goalInML : null;

    // --- Build AI Coach Context ---
    const coachInsights = buildCoachInsights({
      bodyBattery: bbVal, sleepScore, sleepDuration, hrvVal, hrvWeeklyAvg,
      rhr, avgStress, spo2, stepCount, stepGoal, vo2Max
    });

    const result = {
      // Body Battery
      bodyBattery: bbVal,
      bodyBatteryHigh: bbHigh,
      bodyBatteryLow: bbLow,
      bodyBatteryCharged: bbCharged,

      // Sleep
      sleepScore,
      sleepDurationMins: sleepDuration,
      sleepNeedMins: sleepNeed,
      sleepRem, sleepDeep, sleepLight, sleepAwake,
      sleepStart, sleepEnd,

      // HRV
      hrv: hrvVal,
      hrvWeeklyAvg,
      hrvStatus,
      hrvBaseline,
      nightlyHRV,

      // Heart Rate
      restingHR: rhr,
      hrMin, hrMax,
      hr7DayAvg,

      // SpO2
      spo2, spo2Avg, spo2Low,

      // Respiration
      respRate, respSleep, respHigh, respLow,

      // Stress
      avgStress, maxStress,
      stressDuration, restStressDuration,
      lowStressDuration, medStressDuration,

      // Activity
      steps: stepCount,
      stepGoal,
      totalCalories, activeCalories, bmrCalories,
      floorsClimbed, floorsGoal,
      moderateIntensityMins: moderateMins,
      vigorousIntensityMins: vigorousMins,
      totalDistanceMeters: totalDistance,
      activeMinutes,

      // Fitness
      vo2Max, vo2MaxRunning,
      trainingLoad: trainingLoadVal,
      trainingStatus,

      // Recent Activities
      recentActivities: activities,

      // Hydration
      hydrationMl, hydrationGoal,

      // AI Coach
      coachInsights,

      // Meta
      fetchedAt: new Date().toISOString(),
    };

    // Update cached token after successful fetch
    try {
      tokenCache = await GC.exportToken();
    } catch (e) {}

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Garmin data fetch failed: ' + (e.message || String(e)) });
  }
};

// Safe GET that won't throw
async function safeGet(GC, url) {
  try {
    return await GC.get(url);
  } catch (e) {
    return {};
  }
}

// AI Coach insights based on Garmin data
function buildCoachInsights(d) {
  const insights = [];

  // Recovery verdict
  if (d.bodyBattery != null && d.sleepScore != null) {
    const recoveryScore = Math.round(d.bodyBattery * 0.5 + d.sleepScore * 0.3 + (d.hrvVal ? Math.min(100, (d.hrvVal / 60) * 100) * 0.2 : 0));
    if (recoveryScore >= 75) {
      insights.push({ type: 'peak', icon: 'zap', text: 'Recovery is strong. Push intensity today — your body can handle it.' });
    } else if (recoveryScore >= 50) {
      insights.push({ type: 'moderate', icon: 'activity', text: 'Moderate recovery. Train at 70-80% effort, avoid max sprints.' });
    } else {
      insights.push({ type: 'recover', icon: 'moon', text: 'Low recovery. Stick to technical work, mobility, or rest.' });
    }
  }

  // Sleep quality
  if (d.sleepScore != null) {
    if (d.sleepScore < 60) {
      insights.push({ type: 'warning', icon: 'alert', text: 'Poor sleep (' + d.sleepScore + '/100). Nap 20min before training if possible.' });
    }
    if (d.sleepDuration != null && d.sleepDuration < 420) {
      insights.push({ type: 'warning', icon: 'clock', text: 'Only ' + Math.floor(d.sleepDuration / 60) + 'h ' + Math.round(d.sleepDuration % 60) + 'm sleep. Aim for 8h+ tonight.' });
    }
  }

  // HRV analysis
  if (d.hrvVal != null && d.hrvWeeklyAvg != null) {
    const diff = d.hrvVal - d.hrvWeeklyAvg;
    const pct = Math.round((diff / d.hrvWeeklyAvg) * 100);
    if (pct > 10) {
      insights.push({ type: 'peak', icon: 'trending-up', text: 'HRV is ' + Math.abs(pct) + '% above your weekly average. Great day for high-intensity.' });
    } else if (pct < -15) {
      insights.push({ type: 'warning', icon: 'trending-down', text: 'HRV is ' + Math.abs(pct) + '% below average. Signs of accumulated fatigue.' });
    }
  }

  // Stress
  if (d.avgStress != null && d.avgStress > 50) {
    insights.push({ type: 'warning', icon: 'wind', text: 'Elevated stress (' + d.avgStress + '). Do 5min box breathing before your session.' });
  }

  // Resting HR
  if (d.rhr != null) {
    if (d.rhr > 65) {
      insights.push({ type: 'warning', icon: 'heart', text: 'Resting HR elevated at ' + d.rhr + ' bpm. Check hydration and recovery.' });
    } else if (d.rhr <= 50) {
      insights.push({ type: 'peak', icon: 'heart', text: 'Resting HR at ' + d.rhr + ' bpm — elite athletic range.' });
    }
  }

  // SpO2
  if (d.spo2 != null && d.spo2 < 95) {
    insights.push({ type: 'warning', icon: 'droplet', text: 'SpO2 at ' + d.spo2 + '%. Check breathing patterns and room ventilation during sleep.' });
  }

  // Steps
  if (d.stepCount != null && d.stepGoal != null) {
    const pct = Math.round((d.stepCount / d.stepGoal) * 100);
    if (pct < 30) {
      insights.push({ type: 'info', icon: 'footprints', text: 'Low movement today (' + pct + '% of goal). Get a 15min walk before training.' });
    }
  }

  // VO2 Max context
  if (d.vo2Max != null) {
    if (d.vo2Max >= 55) {
      insights.push({ type: 'peak', icon: 'flame', text: 'VO2 Max at ' + d.vo2Max + ' — excellent for a midfielder. Keep building.' });
    } else if (d.vo2Max < 45) {
      insights.push({ type: 'info', icon: 'target', text: 'VO2 Max at ' + d.vo2Max + '. Target 55+ for Seward. Add Zone 2 runs.' });
    }
  }

  if (insights.length === 0) {
    insights.push({ type: 'info', icon: 'check', text: 'All systems nominal. Train as planned.' });
  }

  return insights.slice(0, 6);
}
