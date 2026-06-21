const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;

const submissionBuckets = new Map<string, number[]>();

function getActiveAttempts(bucket: number[], now: number) {
  return bucket.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
}

export const publicSubmissionRateLimit = {
  check(key: string) {
    const now = Date.now();
    const attempts = getActiveAttempts(submissionBuckets.get(key) ?? [], now);
    const isLimited = attempts.length >= RATE_LIMIT_MAX_SUBMISSIONS;

    submissionBuckets.set(key, attempts);

    return {
      isLimited,
      remainingMs: isLimited ? RATE_LIMIT_WINDOW_MS - (now - attempts[0]) : 0
    };
  },

  record(key: string) {
    const now = Date.now();
    const attempts = getActiveAttempts(submissionBuckets.get(key) ?? [], now);
    attempts.push(now);
    submissionBuckets.set(key, attempts);
  }
};
