import {
  cases as historicalCases,
  matchCases as rankCases,
} from "../public/cases.mjs";

function adaptCase(item) {
  const matchedTags = item.matched ?? [];

  return {
    ...item,
    sourceLabel: item.source,
    sourceUrl: item.url,
    followupUrl: item.followup,
    symbol: item.company.charAt(0),
    color: item.color === "blue" ? "pale-blue" : item.color,
    matchedTags,
    matched: matchedTags,
  };
}

export const companyCases = historicalCases.map(adaptCase);

export const cases = companyCases;

export function matchCases(warnings = [], profile = {}) {
  return rankCases(warnings, profile).map(adaptCase);
}
