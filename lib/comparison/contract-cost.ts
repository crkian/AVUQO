/**
 * AVUQO contract comparison math. Pure functions, not provider offers.
 * All monetary inputs and outputs are integer pence to avoid floating-point
 * prices being mistaken for exact contract totals.
 */
export type ContractPricePeriod = {
  months: number;
  monthlyPence: number;
};
export type ContractQuote = {
  minimumTermMonths: number;
  periods: ContractPricePeriod[];
  upfrontPence: number;
  oneOffFeesPence: number;
  oneOffCreditsPence: number;
  description?: string;
};
export type ContractTotal = {
  totalPence: number;
  effectiveMonthlyPence: number;
  minimumTermMonths: number;
  undiscountedRecurringPence: number;
  feePence: number;
  creditPence: number;
};

function nonnegativeInteger(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a nonnegative safe integer.`);
  }
  return value;
}

/**
 * Comparison requires a complete, explicitly priced minimum term.
 * Unknown future increases MUST NOT be guessed as zero. Instead, withhold the
 * result until the provider supplies a valid schedule or firm assumptions.
 */
export function calculateContractTotal(quote: ContractQuote): ContractTotal {
  const months = nonnegativeInteger(quote.minimumTermMonths, "Contract term");
  if (months < 1 || months > 120) throw new Error("Contract term must be 1 to 120 months.");
  if (!quote.periods.length) throw new Error("At least one price period is required.");

  let scheduleMonths = 0;
  let recurring = 0;
  for (const [index, period] of quote.periods.entries()) {
    const count = nonnegativeInteger(period.months, `Period ${index + 1} months`);
    if (!count) throw new Error("A price period must cover at least one month.");
    const price = nonnegativeInteger(period.monthlyPence, `Period ${index + 1} price`);
    scheduleMonths += count;
    recurring += count * price;
    if (!Number.isSafeInteger(recurring)) throw new Error("Contract total exceeds safe precision.");
  }
  if (scheduleMonths !== months) throw new Error("Price schedule must exactly cover the minimum term.");

  const upfront = nonnegativeInteger(quote.upfrontPence, "Upfront charge");
  const fees = nonnegativeInteger(quote.oneOffFeesPence, "One-off fees");
  const credits = nonnegativeInteger(quote.oneOffCreditsPence, "One-off credits");
  const gross = recurring + upfront + fees;
  if (!Number.isSafeInteger(gross)) throw new Error("Contract total exceeds safe precision.");
  if (credits > gross) throw new Error("Credits cannot exceed gross payable cost.");
  const total = gross - credits;
  return {
    totalPence: total,
    effectiveMonthlyPence: Math.round(total / months),
    minimumTermMonths: months,
    undiscountedRecurringPence: recurring,
    feePence: upfront + fees,
    creditPence: credits,
  };
}
