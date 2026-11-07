import test from "node:test";
import assert from "node:assert/strict";

import {
  samples,
  forecast,
  validateProfile,
  parseFinancialCSV,
  zeroScenario,
} from "../lib/finance.js";

import { matchCases } from "../lib/cases.js";

test("calculates four months of flat runway", () => {
  const result = forecast({
    ...samples.studio,
    cash: 12000,
    revenue: 8000,
    payroll: 8000,
    operations: 3000,
    marketing: 0,
    aiCosts: 0,
    growth: 0,
  });

  assert.equal(result.runway, 4);
  assert.equal(result.net, -3000);
  assert.equal(result.series[4].cash, 0);
});

test("positive cash flow does not invent finite runway", () => {
  const result = forecast({
    ...samples.studio,
    revenue: 100000,
    growth: 0,
  });

  assert.equal(result.runway, null);
  assert.equal(result.burn, 0);
});

test("zero starting cash means zero runway", () => {
  const result = forecast({
    ...samples.studio,
    cash: 0,
  });

  assert.equal(result.runway, 0);
});

test("zero revenue does not divide by zero", () => {
  const result = forecast({
    ...samples.studio,
    revenue: 0,
  });

  assert.ok(Number.isFinite(result.net));
});

test("cost reduction improves projected cash", () => {
  const baseline = forecast(samples.studio);

  const changed = forecast(samples.studio, {
    ...zeroScenario(),
    cost: 20,
  });

  assert.ok(
    changed.series[12].cash >
      baseline.series[12].cash
  );
});

test("customer loss reduces projected cash", () => {
  const baseline = forecast(samples.studio);

  const changed = forecast(samples.studio, {
    ...zeroScenario(),
    loss: 20,
  });

  assert.ok(
    changed.series[12].cash <
      baseline.series[12].cash
  );
});

test("churn does not subtract twice from net growth", () => {
  const first = forecast({
    ...samples.studio,
    churn: 0,
  });

  const second = forecast({
    ...samples.studio,
    churn: 10,
  });

  assert.deepEqual(first.series, second.series);
});

test("rejects invalid financial inputs", () => {
  assert.throws(() =>
    validateProfile({
      ...samples.studio,
      cash: -1,
    })
  );

  assert.throws(() =>
    validateProfile({
      ...samples.studio,
      revenue: null,
    })
  );

  assert.throws(() =>
    validateProfile({
      ...samples.studio,
      growth: Infinity,
    })
  );
});

test("rejects unsupported scenario values", () => {
  assert.throws(() =>
    forecast(samples.studio, {
      ...zeroScenario(),
      cost: 100,
    })
  );
});

test("CSV selects the latest month", () => {
  const csv = [
    "month,cash,revenue,payroll,operations,marketing,aiCosts",
    "2026-02,10000,20000,8000,2000,1000,500",
    "2026-01,9000,10000,8000,2000,1000,400",
  ].join("\n");

  const imported = parseFinancialCSV(csv);

  assert.equal(imported.month, "2026-02");
  assert.equal(imported.cash, 10000);
  assert.equal(imported.aiCosts, 500);
  assert.equal(imported.growth, 100);
});

test("CSV accepts quoted cells and a BOM", () => {
  const csv =
    '\uFEFFmonth,cash,revenue,payroll,operations,marketing,aiCosts\r\n' +
    '"2026-01",1000,2000,500,300,100,50';

  const imported = parseFinancialCSV(csv);

  assert.equal(imported.month, "2026-01");
  assert.equal(imported.revenue, 2000);
});

test("CSV rejects duplicate months", () => {
  const csv = [
    "month,cash,revenue,payroll,operations,marketing,aiCosts",
    "2026-01,1000,2000,500,300,100,50",
    "2026-01,1000,2000,500,300,100,50",
  ].join("\n");

  assert.throws(() => parseFinancialCSV(csv));
});

test("CSV rejects unclosed quoted cells", () => {
  const csv = [
    "month,cash,revenue,payroll,operations,marketing,aiCosts",
    '"2026-01,1000,2000,500,300,100,50',
  ].join("\n");

  assert.throws(() => parseFinancialCSV(csv));
});

test("case matching uses explicit risk tags", () => {
  const matched = matchCases([
    {
      id: "cash",
    },
  ]);

  assert.ok(
    matched[0].matchedTags.includes("cash")
  );
});

test("case matching does not invent AI-specific evidence", () => {
  const matched = matchCases([
    {
      id: "ai",
    },
  ]);

  assert.ok(
    matched.every(
      (companyCase) =>
        companyCase.matchedTags.length === 0
    )
  );
});
