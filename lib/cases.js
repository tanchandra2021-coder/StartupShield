export const companyCases = [
  {
    id: "buffer",
    company: "Buffer",
    year: "2016",
    category: "Cash discipline",
    tags: ["cash", "burn"],
    color: "sand",
    symbol: "b.",

    title: "Growth can hide a shrinking cash cushion.",

    problem:
      "Buffer described a cash-flow crisis after expanding its team too quickly.",

    response:
      "Management reduced staffing and revisited financial planning and cash reserves.",

    outcome:
      "A subsequent monthly report documented lower expenses. It also noted that severance delayed some of the savings.",

    limitation:
      "Buffer was a larger software company with different financing and labor costs. This does not establish that staffing cuts are appropriate for your business.",

    sourceLabel: "Founder account · June 16, 2016",

    sourceUrl:
      "https://buffer.com/resources/layoffs-and-moving-forward/",

    followupUrl:
      "https://buffer.com/resources/june-financial-report/",
  },

  {
    id: "baremetrics",
    company: "Baremetrics",
    year: "2017",
    category: "Runway & recovery",
    tags: ["cash", "burn", "retention"],
    color: "pale-blue",
    symbol: "B",

    title: "A recovery is a sequence, not a single fix.",

    problem:
      "The founder reported that the business had roughly eight weeks of cash remaining.",

    response:
      "The account describes changes to spending and revenue generation during its recovery.",

    outcome:
      "The founder reported reaching profitability eight months later. Multiple changes occurred during that period.",

    limitation:
      "This is a retrospective founder account, not an audited experiment. Its customer economics may differ from yours.",

    sourceLabel: "Founder retrospective · 2017",

    sourceUrl:
      "https://baremetrics.com/blog/how-we-went-from-weeks-of-cash-left-in-the-bank-to-profitable-in-8-months",
  },
];

export function matchCases(warnings) {
  const riskTags = new Set(
    warnings.map((warning) => warning.id)
  );

  return companyCases
    .map((companyCase) => ({
      ...companyCase,
      matchedTags: companyCase.tags.filter((tag) =>
        riskTags.has(tag)
      ),
    }))
    .sort(
      (a, b) =>
        b.matchedTags.length - a.matchedTags.length
    );
}
