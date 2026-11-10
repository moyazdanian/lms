// Server Components read the API with plain fetch. While the API container is
// restarting (`docker compose restart api`, a redeploy, a first boot) requests
// either fail instantly with ECONNREFUSED or answer 502 from nginx before
// php-fpm is ready. Without a retry that window surfaces as
// "TypeError: fetch failed" in the server log and an error page in the browser.
//
// Retry only transient failures — transport errors and gateway statuses — until
// the budget runs out. Any other status is a real answer from a reachable API
// and goes straight back to the caller. Every call site is a GET, so repeating
// the request is safe. A healthy API answers on the first attempt, so this adds
// no latency in normal operation.
const RETRY_BUDGET_MS = 25_000;

// `next build` prerenders pages with no API reachable (it runs in its own
// build container), so waiting there would only hit Next's 60s per-page build
// timeout. During the build a failed fetch fails fast, exactly as before.
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const FIRST_DELAY_MS = 250;
const MAX_DELAY_MS = 3_000;

/** Statuses that mean "the API is not serving yet", not "the API said no". */
const GATEWAY_STATUSES = new Set([502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchApi(url, options) {
  if (IS_BUILD) {
    return fetch(url, options);
  }

  const deadline = Date.now() + RETRY_BUDGET_MS;
  let delay = FIRST_DELAY_MS;

  for (;;) {
    try {
      const response = await fetch(url, options);

      if (!GATEWAY_STATUSES.has(response.status) || Date.now() >= deadline) {
        return response;
      }
    } catch (error) {
      if (Date.now() >= deadline) {
        throw error;
      }
    }

    await sleep(Math.min(delay, Math.max(deadline - Date.now(), 0)));
    delay = Math.min(delay * 2, MAX_DELAY_MS);
  }
}
