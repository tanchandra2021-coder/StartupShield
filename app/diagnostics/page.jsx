"use client";

import { useState } from "react";
import { companyCases } from "../../lib/cases";

const INITIAL = {
  industry: "Software / AI",
  prospects: "",
  buyers: "",
  conversionTarget: "5",
  cash: "",
  revenue: "",
  fixedCosts: "",
  variableCosts: "",
  runwayTarget: "6",
  units: "",
  marginTarget: "50",
  alternatives: "",
  advantage: "",
  advantageEvidence: "unknown",
  startingCustomers: "",
  lostCustomers: "",
  churnTarget: "5",
  milestonesDue: "",
  milestonesCompleted: "",
};

const DEMOS = {
  pressure: {
    ...INITIAL,
    prospects: "200",
    buyers: "4",
    cash: "24000",
    revenue: "12000",
    fixedCosts: "15000",
    variableCosts: "6000",
    units: "100",
    alternatives:
      "Spreadsheets, an established software provider, and manual work.",
    advantage:
      "A simpler workflow that reduces administrative work.",
    advantageEvidence: "unsupported",
    startingCustomers: "100",
    lostCustomers: "12",
    milestonesDue: "8",
    milestonesCompleted: "5",
  },
  stronger: {
    ...INITIAL,
    prospects: "200",
    buyers: "30",
    cash: "75000",
    revenue: "30000",
    fixedCosts: "15000",
    variableCosts: "6000",
    units: "200",
    alternatives:
      "Spreadsheets, an established software provider, and manual work.",
    advantage:
      "A workflow that buyers in this fictional example preferred for its simpler setup.",
    advantageEvidence: "supported",
    startingCustomers: "100",
    lostCustomers: "2",
    milestonesDue: "8",
    milestonesCompleted: "8",
  },
};

const GROUPS = [
  {
    area: "Demand",
    title: "Are people paying?",
    note:
      "Use unique prospects and paying buyers from the same defined group and period.",
    fields: [
      ["prospects", "Qualified prospects", "count"],
      ["buyers", "Those prospects who became paying buyers", "count"],
      ["conversionTarget", "Your conversion target (%)", "percent"],
    ],
  },
  {
    area: "Cash",
    title: "How much room do you have?",
    note:
      "Use one month and USD. Enter every expense once. Revenue is assumed collected in the same month.",
    fields: [
      ["cash", "Available cash ($)", "money"],
      ["revenue", "Monthly revenue ($)", "money"],
      ["fixedCosts", "Monthly fixed cash costs ($)", "money"],
      ["variableCosts", "Monthly variable cash costs ($)", "money"],
      ["runwayTarget", "Your runway target (months)", "number"],
    ],
  },
  {
    area: "Pricing",
    title: "Does each sale contribute enough?",
    note:
      "Uses the financial inputs above. Pick a consistent unit: an order, completed job, or subscription-month.",
    fields: [
      ["units", "Units sold during the month", "count"],
      ["marginTarget", "Your contribution margin target (%)", "percent"],
    ],
  },
  {
    area: "Competition",
    title: "Why would buyers choose you?",
    note:
      "This is a guided, self-reported comparison. The app does not search current competitors or interpret the paragraphs.",
    fields: [],
  },
  {
    area: "Retention & execution",
    title: "Do customers stay? Can you deliver?",
    note:
      "Use one month. Churn suits recurring businesses; leave it blank for one-time purchases. Count milestones defined before the month began.",
    fields: [
      ["startingCustomers", "Paying customers at the start", "count"],
      ["lostCustomers", "Customers from that starting group who left", "count"],
      ["churnTarget", "Your maximum monthly churn (%)", "percent"],
      ["milestonesDue", "Milestones due during the month", "count"],
      ["milestonesCompleted", "Those milestones completed on time", "count"],
    ],
  },
];

const INDUSTRIES = [
  "Software / AI",
  "Retail / Ecommerce",
  "Food / Hospitality",
  "Professional services",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Other",
];

const INDUSTRY_WORDS = {
  "Software / AI": ["software", "saas", "artificial intelligence"],
  "Retail / Ecommerce": ["retail", "ecommerce", "e-commerce"],
  "Food / Hospitality": ["food", "restaurant", "hospitality"],
  "Professional services": ["professional", "services"],
  Healthcare: ["health", "medical"],
  Education: ["education", "learning"],
  Manufacturing: ["manufacturing", "hardware"],
  Other: [],
};

const STATUS = {
  attention: "Investigate",
  target: "Entered target met",
  unknown: "More evidence needed",
  evidence: "Self-reported support",
};

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function readNumbers(form) {
  const result = {};

  for (const group of GROUPS) {
    for (const [key, label, type] of group.fields) {
      const raw = String(form[key] ?? "").trim();

      if (!raw) {
        result[key] = null;
        continue;
      }

      const value = Number(raw);
      const positiveTarget = [
        "conversionTarget",
        "marginTarget",
        "runwayTarget",
      ].includes(key);

      if (
        !Number.isFinite(value) ||
        value < 0 ||
        value > 1e10 ||
        (type === "count" && !Number.isInteger(value)) ||
        (type === "percent" && value > 100) ||
        (positiveTarget && value <= 0)
      ) {
        throw new Error(`Check "${label}".`);
      }

      result[key] = value;
    }
  }

  for (const [part, total, message] of [
    ["buyers", "prospects", "Buyers cannot exceed prospects."],
    ["lostCustomers", "startingCustomers", "Lost customers cannot exceed starting customers."],
    ["milestonesCompleted", "milestonesDue", "Completed milestones cannot exceed milestones due."],
  ]) {
    if (
      result[part] !== null &&
      result[total] !== null &&
      result[part] > result[total]
    ) {
      throw new Error(message);
    }
  }

  return result;
}

function diagnose(form) {
  const n = readNumbers(form);
  const results = [];

  function add(area, status, title, finding, next, tags = []) {
    results.push({ area, status, title, finding, next, tags });
  }

  // DEMAND
  if (
    n.prospects === null ||
    n.prospects === 0 ||
    n.buyers === null ||
    n.conversionTarget === null
  ) {
    add(
      "Demand",
      "unknown",
      "Demand needs more evidence",
      "Enter prospects, paying buyers, and a conversion target.",
      "Run a defined sales or paid-pilot test and record actual purchases."
    );
  } else {
    const rate = (n.buyers / n.prospects) * 100;
    const small = n.prospects < 20;
    const below = rate < n.conversionTarget;

    add(
      "Demand",
      small ? "unknown" : below ? "attention" : "target",
      small
        ? "An early demand signal"
        : below
          ? "Conversion is below your target"
          : "Conversion meets your target",
      `${n.buyers} of ${n.prospects} prospects paid: ` +
        `${rate.toFixed(1)}% versus your ${n.conversionTarget}% target. ` +
        (small
          ? "Samples below 20 are left unclassified by this demonstration rule."
          : "This describes this group, not total market demand."),
      below
        ? "Collect rejection reasons. Test one change to targeting, the offer, or price."
        : "Repeat with a comparable group and measure whether buyers stay.",
      below && !small ? ["demand", "conversion"] : []
    );
  }

  // CASH
  const financialsKnown = [
    n.revenue,
    n.fixedCosts,
    n.variableCosts,
  ].every(value => value !== null);

  if (
    !financialsKnown ||
    n.cash === null ||
    n.runwayTarget === null
  ) {
    add(
      "Cash",
      "unknown",
      "Cash evidence is incomplete",
      "Enter available cash, revenue, both expense categories, and your runway target.",
      "Use actual receipts and payments, and identify upcoming obligations."
    );
  } else {
    const burn = n.fixedCosts + n.variableCosts - n.revenue;

    if (burn > 0) {
      const runway = n.cash / burn;
      const below = runway < n.runwayTarget;

      add(
        "Cash",
        below ? "attention" : "target",
        below
          ? "Runway is below your target"
          : "Runway meets your target",
        `Monthly cash shortfall: ${money(burn)}. ` +
          `Estimated runway: ${runway.toFixed(1)} months versus ` +
          `your ${n.runwayTarget}-month target, assuming unchanged monthly levels.`,
        "Use the financial dashboard to compare cost reductions and revenue downside scenarios.",
        below ? ["cash", "burn"] : []
      );
    } else {
      add(
        "Cash",
        n.cash === 0 ? "attention" : "target",
        n.cash === 0
          ? "There is no starting cash cushion"
          : "No net burn at the entered monthly levels",
        `Revenue minus entered costs is ${money(-burn)} per month. ` +
          "A burn-based runway estimate does not apply when that amount is nonnegative.",
        "Check collection delays, seasonality, debt payments, taxes, and reserves.",
        n.cash === 0 ? ["cash"] : []
      );
    }
  }

  // PRICING
  if (
    !financialsKnown ||
    n.revenue === 0 ||
    n.units === null ||
    n.units === 0 ||
    n.marginTarget === null
  ) {
    add(
      "Pricing",
      "unknown",
      "Unit economics need more evidence",
      "Enter positive revenue, units sold, fixed and variable costs, and a margin target.",
      "Choose a consistent sales unit and include all costs that rise with sales."
    );
  } else {
    const price = n.revenue / n.units;
    const cost = n.variableCosts / n.units;
    const contribution = price - cost;
    const margin =
      ((n.revenue - n.variableCosts) / n.revenue) * 100;

    const below = margin < n.marginTarget;
    const breakEven =
      contribution > 0
        ? `${Math.ceil(n.fixedCosts / contribution).toLocaleString()} units per month`
        : "not achievable at the entered price and variable cost";

    add(
      "Pricing",
      below ? "attention" : "target",
      contribution <= 0
        ? "Each unit has no positive contribution"
        : below
          ? "Contribution margin is below your target"
          : "Contribution margin meets your target",
      `Average price: ${money(price)}. Variable cost per unit: ${money(cost)}. ` +
        `Contribution margin: ${margin.toFixed(1)}% versus your ` +
        `${n.marginTarget}% target. Break-even: ${breakEven}.`,
      "Compare a price change with lower delivery costs. Include possible customer loss.",
      below ? ["pricing", "margin", "unit_economics"] : []
    );
  }

  // COMPETITION
  if (!form.alternatives.trim() || !form.advantage.trim()) {
    add(
      "Competition",
      "unknown",
      "Your comparison is incomplete",
      "Describe the alternatives buyers use and your proposed advantage.",
      "Include direct competitors, manual work, spreadsheets, and doing nothing."
    );
  } else if (form.advantageEvidence === "unsupported") {
    add(
      "Competition",
      "attention",
      "Your advantage lacks reported buyer support",
      "You reported testing the advantage without finding supporting buyer evidence.",
      "Ask why buyers prefer their current alternative, then test a revised offer.",
      ["competition", "differentiation"]
    );
  } else if (form.advantageEvidence === "supported") {
    add(
      "Competition",
      "evidence",
      "You report support for your advantage",
      "This assessment records your evidence selection. It has not independently verified your claim or competitor information.",
      "Check competitor claims against dated sources and test whether preference leads to purchases."
    );
  } else {
    add(
      "Competition",
      "unknown",
      "Your advantage remains a hypothesis",
      "You described a proposed advantage but have not reported testing it with buyers.",
      "Compare offers with target buyers and record their choices and reasons."
    );
  }

  // RETENTION AND EXECUTION
  const retentionKnown =
    n.startingCustomers !== null &&
    n.startingCustomers > 0 &&
    n.lostCustomers !== null &&
    n.churnTarget !== null;

  const executionKnown =
    n.milestonesDue !== null &&
    n.milestonesDue > 0 &&
    n.milestonesCompleted !== null;

  const churn = retentionKnown
    ? (n.lostCustomers / n.startingCustomers) * 100
    : null;

  const missed = executionKnown
    ? n.milestonesDue - n.milestonesCompleted
    : null;

  const retentionFlag = retentionKnown && churn > n.churnTarget;
  const executionFlag = executionKnown && missed > 0;

  add(
    "Retention & execution",
    retentionFlag || executionFlag
      ? "attention"
      : retentionKnown && executionKnown
        ? "target"
        : "unknown",
    retentionFlag || executionFlag
      ? "Investigate customer loss or delivery gaps"
      : retentionKnown && executionKnown
        ? "Entered operational targets are met"
        : "Operational evidence is incomplete",
    [
      retentionKnown
        ? `${n.lostCustomers} of ${n.startingCustomers} starting customers left: ` +
          `${churn.toFixed(1)}% churn versus your ${n.churnTarget}% maximum target.`
        : "Retention cannot be assessed from these inputs.",
      executionKnown
        ? `${n.milestonesCompleted} of ${n.milestonesDue} milestones were completed on time; ` +
          `${missed} were missed. Counts do not capture importance.`
        : "Execution cannot be assessed from these inputs.",
    ].join(" "),
    "Interview departing customers and review missed commitments. Measure one improvement next month.",
    [
      ...(retentionFlag ? ["retention"] : []),
      ...(executionFlag ? ["execution", "scaling"] : []),
    ]
  );

  return results;
}

function findCases(result, industry) {
  if (!result.tags.length) return [];

  const words = INDUSTRY_WORDS[industry] || [];

  return companyCases
    .filter(item => !item.analogOnly && !item.identityNeedsReview)
    .map(item => {
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const sector = String(item.industry || "").toLowerCase();

      return {
        ...item,
        matched: tags.filter(tag => result.tags.includes(tag)),
        sectorMatch: words.some(word => sector.includes(word)),
      };
    })
    .filter(item => item.matched.length > 0)
    .sort(
      (a, b) =>
        Number(b.sectorMatch) - Number(a.sectorMatch) ||
        b.matched.length - a.matched.length
    )
    .slice(0, 2);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export default function MarketCheckupPage() {
  const [form, setForm] = useState({ ...INITIAL });
  const [report, setReport] = useState(null);
  const [fictional, setFictional] = useState(false);
  const [error, setError] = useState("");

  function loadDemo(type) {
    const demo = { ...DEMOS[type] };

    setForm(demo);
    setFictional(true);
    setError("");
    setReport({
      results: diagnose(demo),
      industry: demo.industry,
      fictional: true,
    });
  }

  function update(key, value) {
    setForm(previous => ({ ...previous, [key]: value }));
    setReport(null);
    setError("");
  }

  function submit(event) {
    event.preventDefault();

    try {
      setReport({
        results: diagnose(form),
        industry: form.industry,
        fictional,
      });
      setError("");
    } catch (err) {
      setReport(null);
      setError(err.message);
    }
  }

  return (
    <main className="checkup">
      <a href="/" className="brand">StartupShield</a>

      <header>
        <p className="eyebrow">RESEARCH MY MARKET / FIVE-RISK CHECKUP</p>

        <h1>
          Less guesswork.
          <br />
          <em>A clearer next move.</em>
        </h1>

        <p className="intro">
          Explore demand, cash, pricing, competition, and delivery
          using your own evidence and related historical experiences.
        </p>
      </header>

      <section className="demo">
        <strong>Demo mode — no typing required</strong>

        <p>
          Choose a fictional business profile to load the form
          and generate all five assessments immediately.
        </p>

        <div className="buttons">
          <button type="button" onClick={() => loadDemo("pressure")}>
            Demo: under pressure
          </button>

          <button type="button" onClick={() => loadDemo("stronger")}>
            Demo: stronger business
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({ ...INITIAL });
              setReport(null);
              setFictional(false);
              setError("");
            }}
          >
            Clear demo
          </button>
        </div>
      </section>

      {fictional && (
        <p className="notice">
          DEMO MODE — fictional inputs and claims. These examples
          do not establish that any particular intervention works.
        </p>
      )}

      {report && (
        <section className="results" aria-live="polite">
          <p className="eyebrow">YOUR RESULTS</p>
          <h2>What the evidence says.</h2>

          <div className="summary">
            {report.results.map(result => (
              <a
                key={result.area}
                href={`#result-${result.area.replace(/[^a-z]/gi, "")}`}
                className={`summaryItem ${result.status}`}
              >
                <strong>{result.area}</strong>
                <span>{STATUS[result.status]}</span>
              </a>
            ))}
          </div>

          {report.results.map(result => {
            const cases = findCases(result, report.industry);

            return (
              <article
                className="panel"
                id={`result-${result.area.replace(/[^a-z]/gi, "")}`}
                key={result.area}
                style={{ scrollMarginTop: "110px" }}
              >
                <div className="resultHeader">
                  <p className="eyebrow">{result.area}</p>
                  <span className={`badge ${result.status}`}>
                    {STATUS[result.status]}
                  </span>
                </div>

                <h3>{result.title}</h3>
                <p>{result.finding}</p>

                <div className="next">
                  <strong>Next investigation</strong>
                  <p>{result.next}</p>
                </div>

                {cases.length > 0 ? (
                  <div className="cases">
                    <h4>Related historical experiences</h4>

                    {cases.map(item => {
                      const url = safeUrl(item.sourceUrl || item.url);

                      return (
                        <article className="story" key={item.id}>
                          <h3>{item.company}</h3>

                          <p className="small">
                            Shared tags: {item.matched.join(", ")}.
                            {item.sectorMatch
                              ? " Industry metadata also overlaps."
                              : " This may be a cross-industry comparison."}
                          </p>

                          <p>
                            <strong>Challenge: </strong>
                            {item.problem || "Not documented."}
                          </p>

                          <p>
                            <strong>Reported response: </strong>
                            {item.response || "Not documented."}
                          </p>

                          <p>
                            <strong>Reported outcome: </strong>
                            {item.outcome || item.result || "Not documented."}
                          </p>

                          <p className="small">
                            <strong>Comparison limits: </strong>
                            {item.limitation ||
                              "Differences in scale, market, and period may limit relevance."}
                          </p>

                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Read the source ↗
                            </a>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="small">
                    {result.tags.length
                      ? "No eligible historical case shares these tags in the current library."
                      : "No risk-based historical match selected for this result."}
                  </p>
                )}
              </article>
            );
          })}

          <p className="small">
            Meeting a target does not establish overall business health.
            Historical matching uses tags and approximate industry metadata,
            not statistical similarity. Reported outcomes do not establish
            causation. This tool does not predict startup failure.
          </p>
        </section>
      )}

      <form onSubmit={submit}>
        <section className="panel">
          <h2>{report ? "Explore the loaded inputs." : "Start with your evidence."}</h2>

          <label>
            Industry
            <select
              value={form.industry}
              onChange={event => update("industry", event.target.value)}
            >
              {INDUSTRIES.map(industry => (
                <option key={industry}>{industry}</option>
              ))}
            </select>
          </label>

          <p className="small">
            Leave unknown values blank. Editable targets are planning
            assumptions, not validated industry benchmarks. Calculations
            run in your browser without an AI API.
          </p>
        </section>

        {GROUPS.map((group, index) => (
          <section className="panel" key={group.area}>
            <p className="eyebrow">
              0{index + 1} / {group.area}
            </p>

            <h2>{group.title}</h2>
            <p className="small">{group.note}</p>

            <div className="grid">
              {group.fields.map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input
                    type="number"
                    min="0"
                    max={type === "percent" ? "100" : undefined}
                    step={type === "count" ? "1" : "any"}
                    value={form[key]}
                    placeholder="Unknown"
                    onChange={event => update(key, event.target.value)}
                  />
                </label>
              ))}
            </div>

            {group.area === "Competition" && (
              <>
                <label>
                  What alternatives do buyers currently use?
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={form.alternatives}
                    onChange={event =>
                      update("alternatives", event.target.value)
                    }
                  />
                </label>

                <label>
                  What is your proposed advantage?
                  <textarea
                    rows={3}
                    maxLength={1500}
                    value={form.advantage}
                    onChange={event =>
                      update("advantage", event.target.value)
                    }
                  />
                </label>

                <label>
                  What evidence supports the advantage?
                  <select
                    value={form.advantageEvidence}
                    onChange={event =>
                      update("advantageEvidence", event.target.value)
                    }
                  >
                    <option value="unknown">Not tested / unknown</option>
                    <option value="supported">
                      Tested with buyers; found supporting evidence
                    </option>
                    <option value="unsupported">
                      Tested with buyers; did not find supporting evidence
                    </option>
                  </select>
                </label>
              </>
            )}
          </section>
        ))}

        {error && <p className="error" role="alert">{error}</p>}

        <button className="primary" type="submit">
          Run my five-risk checkup ↗
        </button>
      </form>

      <footer>
        <a href="/">← Back to financial dashboard</a>
      </footer>

      <style jsx>{`
        .checkup {
          background: #f8f7f3;
          color: #34372f;
          min-height: 100vh;
          padding: 35px max(20px, calc((100% - 1000px) / 2)) 65px;
          font-family: Arial, sans-serif;
          line-height: 1.65;
        }
        .brand {
          font-family: Georgia, serif;
          font-size: 27px;
          font-style: italic;
          text-decoration: none;
          color: inherit;
        }
        header { padding: 25px 0; }
        h1, h2, h3 {
          font-family: Georgia, serif;
          font-weight: 400;
          line-height: 1.15;
        }
        h1 {
          font-size: clamp(46px, 7vw, 80px);
          letter-spacing: -2px;
          margin: 20px 0;
        }
        h2 { font-size: 32px; margin: 12px 0 22px; }
        h3 { font-size: 27px; margin: 15px 0; }
        h4 { font-size: 17px; }
        .eyebrow {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .intro { color: #707568; max-width: 650px; font-size: 18px; }
        .demo, .panel {
          border: 1px solid #deded5;
          border-radius: 17px;
          padding: 27px;
          margin-bottom: 22px;
        }
        .demo { background: #edf0f9; }
        .panel { background: #fcfbf8; }
        .buttons { display: flex; flex-wrap: wrap; gap: 10px; }
        button {
          padding: 12px 18px;
          border: 1px solid #cdd0c3;
          border-radius: 28px;
          background: #fffefa;
          color: #34372f;
          font: inherit;
          cursor: pointer;
        }
        .primary {
          width: 100%;
          border: 0;
          background: #193ec2;
          color: white;
          padding: 19px;
          font-size: 18px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 17px;
          font-size: 14px;
          color: #686e60;
          min-width: 0;
        }
        input, textarea, select {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          padding: 13px;
          border: 1px solid #d5d8cc;
          border-radius: 11px;
          background: #fffefa;
          color: #34372f;
          font: inherit;
          font-size: 16px;
        }
        textarea { resize: vertical; }
        input:focus, textarea:focus, select:focus {
          outline: 2px solid #193ec2;
        }
        .small { font-size: 12px; color: #737868; }
        .notice, .error { padding: 15px; border-radius: 12px; }
        .notice { background: #f4eadb; color: #775521; }
        .error { background: #f9e8e8; color: #912e2e; }
        .results { margin: 40px 0 55px; }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
          gap: 10px;
          margin-bottom: 25px;
        }
        .summaryItem {
          border-radius: 12px;
          padding: 16px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .summaryItem span { font-size: 12px; }
        .resultHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .badge {
          font-size: 12px;
          border-radius: 25px;
          padding: 7px 12px;
        }
        .attention { background: #f5e6d6; color: #85551d; }
        .target, .evidence { background: #e7eddf; color: #445a35; }
        .unknown { background: #ecebe7; color: #666a60; }
        .next {
          padding: 18px;
          background: #edf0f9;
          border-radius: 12px;
          margin: 20px 0;
        }
        .next p { margin-bottom: 0; }
        .cases {
          border-top: 1px solid #deded5;
          padding-top: 16px;
          margin-top: 24px;
        }
        .story {
          background: #eeeee7;
          border-radius: 12px;
          padding: 20px;
          margin-top: 15px;
          overflow-wrap: anywhere;
        }
        .story p { font-size: 14px; }
        a { color: #193ec2; }
        footer { margin-top: 35px; }
        @media (max-width: 600px) {
          .grid { grid-template-columns: 1fr; gap: 0; }
          .panel, .demo { padding: 20px; }
        }
      `}</style>
    </main>
  );
}
