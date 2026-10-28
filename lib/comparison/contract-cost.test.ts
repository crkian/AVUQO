import assert from "node:assert/strict";
import test from "node:test";
import { calculateContractTotal } from "./contract-cost.ts";

test("flat SIM-only cost includes one-off fees", () => {
  const actual = calculateContractTotal({
    minimumTermMonths: 12,
    periods: [{ months: 12, monthlyPence: 1000 }],
    upfrontPence: 0,
    oneOffFeesPence: 500,
    oneOffCreditsPence: 0,
  });
  assert.equal(actual.totalPence, 12500);
  assert.equal(actual.effectiveMonthlyPence, 1042);
});

test("broadband introductory discounts and later price changes", () => {
  const actual = calculateContractTotal({
    minimumTermMonths: 24,
    periods: [{ months: 6, monthlyPence: 2000 }, { months: 18, monthlyPence: 3500 }],
    upfrontPence: 2500,
    oneOffFeesPence: 1000,
    oneOffCreditsPence: 3000,
  });
  assert.equal(actual.totalPence, 75500);
});

test("rejects incomplete price schedule rather than guessing unknown rises", () => {
  assert.throws(() => calculateContractTotal({
    minimumTermMonths: 18,
    periods: [{ months: 12, monthlyPence: 1999 }],
    upfrontPence: 0, oneOffFeesPence: 0, oneOffCreditsPence: 0,
  }), /exactly cover/);
});

test("rejects invalid charges and excessive credits", () => {
  const input = {
    minimumTermMonths: 1,
    periods: [{ months: 1, monthlyPence: 500 }],
    upfrontPence: 0, oneOffFeesPence: 0, oneOffCreditsPence: 501,
  };
  assert.throws(() => calculateContractTotal(input), /Credits/);
  assert.throws(() => calculateContractTotal({ ...input, oneOffCreditsPence: 0, upfrontPence: -1 }), /nonnegative/);
});
