const pLimit = require('p-limit');
const env = require('../config/env');
const { SUPPORTED_COUNTRIES } = require('../config/countries');
const newsService = require('../services/newsService');

/**
 * Ported from the uploaded NewsRefreshScheduler.java: fires a concurrent burst of
 * refreshes across all 195 countries (capped at `refreshConcurrency` in flight at
 * once — default 50, matching the original's fixed thread pool of 50), and logs how
 * long the burst took. Like Java's `executor.awaitTermination(3, SECONDS)`, the
 * 3-second soft cap only stops *waiting* for stragglers — it doesn't cancel them.
 * Any fetch still in flight past that point keeps running to completion in the
 * background; it isn't killed.
 */
function startScheduler() {
  const tick = async () => {
    const countryCodes = Object.keys(SUPPORTED_COUNTRIES);
    console.log(`[scheduler] Starting global news refresh for ${countryCodes.length} countries...`);
    const startedAt = Date.now();

    const limit = pLimit(env.refreshConcurrency);
    const allDone = Promise.all(
      countryCodes.map((code) =>
        limit(() =>
          newsService.refreshCountryHeadlines(code).catch((err) => {
            console.error(`[scheduler] Failed for ${code}: ${err.message}`);
          })
        )
      )
    );

    const softCap = new Promise((resolve) => setTimeout(resolve, env.refreshSoftCapMs));
    await Promise.race([allDone, softCap]);

    console.log(`[scheduler] Global refresh burst finished (or hit the soft cap) after ${Date.now() - startedAt}ms`);

    // Let any still-running fetches settle quietly in the background rather than
    // leaving unhandled-rejection warnings if one fails after the race above resolved.
    allDone.catch(() => {});
  };

  setTimeout(tick, 5000); // initial delay, matches the original's initialDelay = 5000
  setInterval(tick, env.refreshIntervalMs);
}

module.exports = { startScheduler };
