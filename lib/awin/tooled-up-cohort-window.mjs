// One source row can yield at most one candidate. Window width must never exceed the RPC cap.
export const TOOLED_UP_COHORT_CAP = 1500;
export function tooledUpCohortStart(rows, now) {
  const windows = Math.max(1, Math.ceil(rows / TOOLED_UP_COHORT_CAP));
  return (Math.floor(now / (5 * 60_000)) % windows) * TOOLED_UP_COHORT_CAP;
}
