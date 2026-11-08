"use client";

import { useState } from "react";
import { companyCases } from "../../lib/cases";

const initial = {
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
  marginTarget: "40",
  alternatives: "",
  advantage: "",
  advantageEvidence: "unknown",
  interviews: "",
  preferences: "",
  startingCustomers: "",
 lostCustomers: "",
  churnTarget: "5",
  milestonesDue: "",
  milestonesCompleted: "",
};

const example = {
  ...initial,
  prospects: "200",
  buyers: "4",
  cash: "30000",
  revenue: "10000",
  fixedCosts: "12000",
  variableCosts: "6000",
  units: "100",
  marginTarget: "50",
  alternatives:
    "Spreadsheets, an established software provider, and manual work.",
  advantage:
    "Our proposed advantage is reducing weekly administrative work.",
  interviews: "10",
  preferences: "2",
  startingCustomers: "100",
  lostCustomers: "12",
  milestonesDue: "8",
  milestonesCompleted: "5",
};

const industries = [
  "Software / AI",
  "Retail / Ecommerce",
  "Food / Hospitality",
  "Professional services",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Other",
];

const industryWords = {
  "Software / AI": ["software", "saas", "artificial intelligence"],
  "Retail / Ecommerce": ["retail", "ecommerce", "e-commerce"],
  "Food / Hospitality": ["food", "restaurant", "hospitality"],
  "Professional services": ["professional", "services"],
  Healthcare: ["health", "medical"],
  Education: ["education", "learning"],
  Manufacturing: ["manufacturing", "hardware"],
  Other: [],
};

const labels = {
  prospects: "Qualified prospects",
  buyers: "Paying buyers from that group",
  conversionTarget: "Your conversion target (%)",
  cash: "Available cash ($)",
  revenue: "Monthly revenue ($)",
  fixedCosts: "Monthly fixed cash costs ($)",
  variableCosts: "Monthly variable cash costs ($)",
  runwayTarget: "Your runway target (months)",
  units: "Units sold that month",
  marginTarget: "Your contribution margin target (%)",
  interviews: "Buyers shown comparable alternatives",
  preferences: "Those buyers who preferred your offer",
  startingCustomers: "Paying customers at the start of the month",
  lostCustomers: "Customers from that starting group who left",
  churnTarget: "Your maximum monthly customer churn (%)",
  milestonesDue: "Milestones due during the month",
  milestonesCompleted: "Those milestones completed on time",
};

const countFields = new Set([
  "prospects",
  "buyers",
  "units",
  "interviews",
  "preferences",
  "startingCustomers",
  "lostCustomers",
  "milestonesDue",
  "milestonesCompleted",
]);

const percentFields = new Set([
  "conversionTarget",
  "marginTarget",
  "churnTarget",
]);

const positiveFields = new Set([
  "conversionTarget",
  "runwayTarget",
  "marginTarget",
]);

const statusLabels = {
  attention: "Investigate",
  target: "Entered target met",
  unknown: "More evidence needed",
  evidence: "Self-reported evidence",
};

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function readNumbers(form) {
  const values = {};

  for (const key of Object.keys(labels)) {
    const raw = String(form[key] ?? "").trim();

    if (raw === "") {
      values[key] = null;
      continue;
    }

    const value = Number(raw);

    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > 1e12 ||
      (countFields.has(key) && !Number.isInteger(value)) ||
      (percentFields.has(key) && value > 100) ||
      (positiveFields.has(key) && value <= 0)
    ) {
      throw new Error(`Enter a valid value for "${labels[key]}".`);
    }

    values[key] = value;
  }

  const pairs = [
    ["buyers", "prospects"],
    ["preferences", "interviews"],
    ["lostCustomers", "startingCustomers"],
    ["milestonesCompleted", "milestonesDue"],
  ];

  for (const [part, total] of pairs) {
    if (
      values[part] !== null &&
      values[total] !== null &&
      values[part] > values[total]
    ) {
      throw new Error(
        `"${labels[part]}" cannot exceed "${labels[total]}".`
      );
    }
  }

  return values;
}

function diagnose(form) {
  const n = readNumbers(form);
  const results = [];

  function add(area, status, title, finding, next, tags = []) {
    results.push({ area, status, title, finding, next, tags });
  }

  // 1. DEMAND
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
      "Enter qualified prospects, paying buyers, and your conversion target.",
      "Run a defined paid-pilot or sales test. Count buyers and prospects from the same group and period."
    );
  } else {
    const conversion = (n.buyers / n.prospects) * 100;
    const below = conversion < n.conversionTarget;
    const small = n.prospects < 20;

    add(
      "Demand",
      small ? "unknown" : below ? "attention" : "target",
      small
        ? "An early demand signal"
        : below
          ? "Paid conversion is below your target"
          : "Paid conversion meets your target",
      `${n.buyers} of ${n.prospects} qualified prospects paid: ` +
        `${conversion.toFixed(1)}% versus your ` +
        `${n.conversionTarget}% target. ` +
        (small
          ? "This prototype leaves samples below 20 prospects unclassified; that cutoff is a demonstration rule."
          : "This measures the entered group, not total market demand."),
      below
        ? "Record rejection reasons, then test one change to the audience, offer, or price."
        : "Repeat the test with a comparable group and track whether buyers stay.",
      below && !small ? ["demand", "conversion"] : []
    );
  }

  // 2. CASH
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
      "Your cash outlook is incomplete",
      "Enter available cash, monthly revenue, both cost categories, and your runway target.",
      "Collect actual receipts and payments, including upcoming bills."
    );
  } else {
    const burn = n.fixedCosts + n.variableCosts - n.revenue;

    if (burn > 0) {
      const runway = n.cash / burn;
      const short = runway < n.runwayTarget;

      add(
        "Cash",
        short ? "attention" : "target",
        short
          ? "Cash runway is below your target"
          : "Cash runway meets your target",
        `Spending exceeds monthly revenue by ${money(burn)}. ` +
          `${money(n.cash)} covers approximately ` +
          `${runway.toFixed(1)} months versus your ` +
          `${n.runwayTarget}-month target.`,
        "Use the financial dashboard to compare lower spending and weaker revenue. Include cash collection delays.",
        short ? ["cash", "burn"] : []
      );
    } else {
      add(
        "Cash",
        n.cash === 0 ? "attention" : "target",
        n.cash === 0
          ? "There is no starting cash cushion"
          : "No monthly net burn at these levels",
        `Revenue minus entered expenses is ${money(-burn)} per month. ` +
          "A burn-based runway estimate does not apply when this amount is nonnegative.",
        "Check payment timing, seasonality, taxes, debt payments, and emergency reserves.",
        n.cash === 0 ? ["cash"] : []
      );
    }
  }

  // 3. PRICING
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
      "Enter positive revenue, units sold, variable costs, fixed costs, and a margin target.",
      "Use a consistent unit, such as one order, completed job, or subscription-month."
    );
  } else {
    const price = n.revenue / n.units;
    const unitCost = n.variableCosts / n.units;
    const contribution = price - unitCost;
    const margin =
      ((n.revenue - n.variableCosts) / n.revenue) * 100;

    const below = margin < n.marginTarget;

    const breakEven =
      contribution > 0
        ? `${Math.ceil(n.fixedCosts / contribution).toLocaleString()} units per month`
        : "not achievable with the entered price and variable cost";

    add(
      "Pricing",
      below ? "attention" : "target",
      contribution <= 0
        ? "Each unit has no positive contribution"
        : below
          ? "Contribution margin is below your target"
          : "Contribution margin meets your target",
      `Average revenue per unit: ${money(price)}. ` +
        `Variable cost per unit: ${money(unitCost)}. ` +
        `Contribution margin: ${margin.toFixed(1)}% versus your ` +
        `${n.marginTarget}% target. Break-even: ${breakEven}.`,
      "Compare a price change with a delivery-cost reduction. Include potential customer loss and costs that rise with sales.",
      below ? ["pricing", "margin", "unit_economics"] : []
    );
  }

  // 4. COMPETITION
  const comparisonReady =
    form.alternatives.trim() && form.advantage.trim();

  const preferenceText =
    n.interviews !== null &&
    n.interviews > 0 &&
    n.preferences !== null
      ? ` You report that ${n.preferences} of ${n.interviews} ` +
        "interviewed buyers preferred your offer. Preference is not a purchase."
      : "";

  if (!comparisonReady) {
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
      "Your proposed advantage lacks buyer support",
      "You reported testing the advantage without finding supporting buyer evidence." +
        preferenceText,
      "Ask buyers why they prefer their current alternative. Test a revised offer against it.",
      ["competition", "differentiation"]
    );
  } else if (form.advantageEvidence === "supported") {
    add(
      "Competition",
      "evidence",
      "You report support for your advantage",
      "This evidence is self-reported. Competitor claims have not been independently verified." +
        preferenceText,
      "Check competitor claims against dated sources and test whether preference leads to paid switching."
    );
  } else {
    add(
      "Competition",
      "unknown",
      "Your advantage remains a hypothesis",
      "You described an advantage but have not established buyer support." +
        preferenceText,
      "Show comparable offers to target buyers and record their choices and reasons."
    );
  }

  // 5. RETENTION AND EXECUTION
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

  const operationalText = [
    retentionKnown
      ? `${n.lostCustomers} of ${n.startingCustomers} starting ` +
        `customers left: ${churn.toFixed(1)}% monthly churn versus ` +
        `your ${n.churnTarget}% maximum target.`
      : "Retention cannot be assessed from the supplied inputs.",
    executionKnown
      ? `${n.milestonesCompleted} of ${n.milestonesDue} due milestones ` +
        `were completed on time; ${missed} were missed. ` +
        "Counts do not capture milestone importance."
      : "Execution cannot be assessed from the supplied inputs.",
  ].join(" ");

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
    operationalText,
    "Interview departing customers and review missed commitments. Choose one improvement and measure it next month.",
    [
      ...(retentionFlag ? ["retention"] : []),
      ...(executionFlag ? ["execution", "scaling"] : []),
    ]
  );

  return results;
}

function findCases(result, industry) {
  if (!result.tags.length) return [];

  const words = industryWords[industry] || [];

  return companyCases
    .filter(item => !item.analogOnly && !item.identityNeedsReview)
    .map(item => {
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const matched = tags.filter(tag => result.tags.includes(tag));
      const sector = String(item.industry || "").toLowerCase();

      return {
        ...item,
        matched,
        sectorMatch: words.some(word => sector.includes(word)),
      };
    })
    .filter(item => item.matched.length > 0)
    .sort(
      (a, b) =>
        Number(b.sectorMatch) - Number(a.sectorMatch) ||
        b.matched.length - a.matched.length ||
        String(a.company).localeCompare(String(b.company))
    )
    .slice(0, 2);
}

function sourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export default function CheckupPage() {
  const [form, setForm] = useState({ ...initial });
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [fictional, setFictional] = useState(false);

  function update(key, value) {
    setForm(previous => ({ ...previous, [key]: value }));
    setReport(null);
    setError("");
  }

  function submit(event) {
    event.preventDefault();
    setError("");

    try {
      setReport({
        results: diagnose(form),
        industry: form.industry,
        fictional,
      });
    } catch (err) {
      setReport(null);
      setError(err.message);
    }
  }

  function field(key) {
    return (
      <label className="field" key={key}>
        <span>{labels[key]}</span>

        <input
          type="number"
          min="0"
          max={percentFields.has(key) ? "100" : undefined}
          step={countFields.has(key) ? "1" : "any"}
          value={form[key]}
          onChange={event => update(key, event.target.value)}
          placeholder="Unknown"
        />
      </label>
    );
  }

  return (
    <main className="checkup">
      <header className="hero">
        <p className="eyebrow">THE FIVE-RISK CHECKUP</p>

        <h1>
          A little clarity.
          <br />
          <em>A better next move.</em>
        </h1>

        <p className="intro">
          Explore demand, cash, pricing, competition, and delivery.
          Use your evidence to find the questions worth asking next.
        </p>

        <p className="small">
          No AI key required. This checkup calculates results in your
          browser and does not intentionally save or send your entries.
        </p>

        <div className="actions">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setForm({ ...example });
              setFictional(true);
              setReport(null);
              setError("");
            }}
          >
            Try a fictional example
          </button>

          <button
            type="button"
            className="secondary"
            onClick={() => {
              setForm({ ...initial });
              setFictional(false);
              setReport(null);
              setError("");
            }}
          >
            Clear inputs
          </button>
        </div>
      </header>

      <form onSubmit={submit}>
        <section className="panel">
          <h2>Set the context.</h2>

          <label className="field">
            <span>Industry</span>

            <select
              value={form.industry}
              onChange={event => update("industry", event.target.value)}
            >
              {industries.map(industry => (
                <option key={industry}>{industry}</option>
              ))}
            </select>
          </label>

          <p className="small">
            Use USD and one consistent month for financial, customer
            churn, and milestone inputs. Demand inputs must describe
            the same prospect group over the same period. Leave
            unavailable numbers blank.
          </p>

          <p className="small">
            Editable targets are planning assumptions, not validated
            industry benchmarks or predictions of failure.
          </p>

          {fictional && (
            <p className="notice">
              Fictional example loaded. All example numbers and
              customer claims are demonstration data.
            </p>
          )}
        </section>

        <section className="panel">
          <p className="eyebrow">01 / DEMAND</p>
          <h2>Are people paying?</h2>

          <div className="grid">
            {field("prospects")}
            {field("buyers")}
            {field("conversionTarget")}
          </div>

          <p className="small">
            Count unique prospects and buyers, not visits or orders.
            Define the group before reviewing its results.
          </p>
        </section>

        <section className="panel">
          <p className="eyebrow">02 / CASH</p>
          <h2>How much room do you have?</h2>

          <div className="grid">
            {field("cash")}
            {field("revenue")}
            {field("fixedCosts")}
            {field("variableCosts")}
            {field("runwayTarget")}
          </div>

          <p className="small">
            Enter every expense once. Fixed costs stay broadly
            constant; variable costs rise with sales. The estimate
            assumes revenue is collected and costs are paid in the
            same month, with unchanged monthly levels.
          </p>
        </section>

        <section className="panel">
          <p className="eyebrow">03 / PRICING</p>
          <h2>Does each sale contribute enough?</h2>

          <div className="grid">
            {field("units")}
            {field("marginTarget")}
          </div>

          <p className="small">
            Uses the revenue and cost inputs above. A unit could be
            an order, completed job, or subscription-month. Average
            figures can hide differences between products and buyers.
          </p>
        </section>

        <section className="panel">
          <p className="eyebrow">04 / COMPETITION</p>
          <h2>Why would a buyer choose you?</h2>

          <label className="field">
            <span>Which alternatives do your buyers currently use?</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={form.alternatives}
              onChange={event => update("alternatives", event.target.value)}
              placeholder="Names, features, prices, and dated sources if available."
            />
          </label>

          <label className="field">
            <span>What is your proposed advantage?</span>
            <textarea
              rows={3}
              maxLength={1500}
              value={form.advantage}
              onChange={event => update("advantage", event.target.value)}
              placeholder="Describe a specific benefit you can test."
            />
          </label>

          <label className="field">
            <span>What have you established about that advantage?</span>
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

          <div className="grid">
            {field("interviews")}
            {field("preferences")}
          </div>

          <p className="small">
            This is a guided comparison. The code does not search
            the web, interpret your paragraphs, or independently
            verify claims. Stated preference is not proof of purchasing.
          </p>
        </section>

        <section className="panel">
          <p className="eyebrow">05 / RETENTION & EXECUTION</p>
          <h2>Do customers stay? Can you deliver?</h2>

          <div className="grid">
            {field("startingCustomers")}
            {field("lostCustomers")}
            {field("churnTarget")}
            {field("milestonesDue")}
            {field("milestonesCompleted")}
          </div>

          <p className="small">
            Customer churn suits recurring businesses. For one-time
            purchases, leave it blank and track repeat buying separately.
            Define milestones before the month begins.
          </p>
        </section>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button className="primary" type="submit">
          Run my five-risk checkup ↗
        </button>
      </form>

      {report && (
        <section className="results" aria-live="polite">
          <p className="eyebrow">YOUR RESULTS</p>
          <h2>What your evidence says.</h2>

          {report.fictional && (
            <p className="notice">
              This report uses fictional demonstration inputs.
            </p>
          )}

          <p className="small">
            Each result assesses the entered measures. Meeting
            a target does not establish overall business health.
          </p>

          {report.results.map(result => {
            const matches = findCases(result, report.industry);

            return (
              <article className="result" key={result.area}>
                <div className="resultHeader">
                  <p className="eyebrow">{result.area}</p>
                  <span className={`badge ${result.status}`}>
                    {statusLabels[result.status]}
                  </span>
                </div>

                <h3>{result.title}</h3>
                <p>{result.finding}</p>

                <div className="next">
                  <strong>Next investigation</strong>
                  <p>{result.next}</p>
                </div>

                {matches.length > 0 ? (
                  <div className="cases">
                    <h4>Related historical experiences</h4>

                    {matches.map(item => {
                      const url = sourceUrl(item.sourceUrl || item.url);

                      return (
                        <div className="case" key={item.id}>
                          <h4>{item.company}</h4>

                          <p className="small">
                            Shared risk tags: {item.matched.join(", ")}.
                            {item.sectorMatch
                              ? " Industry metadata also overlaps."
                              : " This may be a cross-industry comparison."}
                          </p>

                          <p>
                            <strong>Challenge: </strong>
                            {item.problem || "Not documented in this entry."}
                          </p>

                          <p>
                            <strong>Reported response: </strong>
                            {item.response || "Not documented in this entry."}
                          </p>

                          <p>
                            <strong>Reported outcome: </strong>
                            {item.outcome ||
                              item.result ||
                              "Not documented in this entry."}
                          </p>

                          <p className="small">
                            <strong>Comparison limits: </strong>
                            {item.limitation ||
                              "Differences in market, scale, and time period may make this comparison unsuitable."}
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
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="small">
                    {result.tags.length
                      ? "No eligible historical case shares these risk tags in the current library."
                      : "No risk-based historical match selected for this result."}
                  </p>
                )}
              </article>
            );
          })}

          <p className="small">
            Historical matching uses shared tags and approximate
            industry metadata, not statistical similarity. Reported
            outcomes do not establish causation. This checkup does
            not predict failure or guarantee an intervention will work.
          </p>
        </section>
      )}

      <footer>
        <a href="/">← Back to StartupShield</a>
      </footer>

      <style jsx>{`
        .checkup {
          box-sizing: border-box;
          width: 100%;
          background: #f8f7f3;
          color: #34372f;
          padding: 60px max(22px, calc((100% - 1000px) / 2)) 70px;
          font-family: Arial, sans-serif;
          line-height: 1.65;
        }

        .hero {
          padding-bottom: 40px;
        }

        .eyebrow {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 16px 0 12px;
        }

        h1,
        h2,
        h3 {
          font-family: Georgia, serif;
          font-weight: 400;
          line-height: 1.12;
        }

        h1 {
          font-size: clamp(48px, 7vw, 82px);
          letter-spacing: -2px;
          margin: 20px 0;
        }

        h2 {
          font-size: clamp(28px, 4vw, 39px);
          margin: 12px 0 24px;
        }

        h3 {
          font-size: 29px;
          margin: 18px 0;
        }

        h4 {
          margin: 0 0 12px;
          font-size: 17px;
        }

        .intro {
          max-width: 650px;
          font-size: 18px;
          color: #686c61;
        }

        .small {
          font-size: 13px;
          color: #707568;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .panel,
        .result {
          padding: 28px;
          border: 1px solid #deded5;
          border-radius: 18px;
          margin-bottom: 20px;
          background: #fcfbf8;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 18px;
          font-size: 14px;
          color: #62685b;
          min-width: 0;
        }

        input,
        textarea,
        select {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          border: 1px solid #d5d8cc;
          border-radius: 12px;
          padding: 14px;
          color: #34372f;
          background: #fffefa;
          font: inherit;
          font-size: 16px;
        }

        textarea {
          resize: vertical;
        }

        input:focus,
        textarea:focus,
        select:focus {
          outline: 2px solid #193ec2;
          outline-offset: 2px;
        }

        button {
          font: inherit;
          cursor: pointer;
        }

        .primary {
          width: 100%;
          border: 0;
          border-radius: 40px;
          background: #193ec2;
          color: white;
          padding: 20px;
          font-size: 18px;
        }

        .secondary {
          border: 1px solid #cdd0c3;
          background: transparent;
          border-radius: 30px;
          color: inherit;
          padding: 11px 18px;
        }

        .results {
          margin-top: 65px;
        }

        .resultHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .badge {
          font-size: 12px;
          border-radius: 24px;
          padding: 7px 12px;
        }

        .attention {
          background: #f5e6d6;
          color: #85551d;
        }

        .target,
        .evidence {
          background: #e7eddf;
          color: #445a35;
        }

        .unknown {
          background: #ecebe7;
          color: #666a60;
        }

        .next {
          background: #edf0f9;
          padding: 18px;
          border-radius: 12px;
          margin-top: 22px;
        }

        .next p {
          margin-bottom: 0;
        }

        .cases {
          border-top: 1px solid #deded5;
          margin-top: 26px;
          padding-top: 24px;
        }

        .case {
          background: #f0efe9;
          border-radius: 12px;
          padding: 20px;
          margin-top: 16px;
          overflow-wrap: anywhere;
        }

        .case p {
          font-size: 14px;
        }

        a {
          color: #193ec2;
        }

        .notice,
        .error {
          padding: 16px;
          border-radius: 12px;
        }

        .notice {
          background: #f4eadb;
          color: #775521;
        }

        .error {
          background: #f9e8e8;
          color: #912e2e;
        }

        footer {
          margin-top: 40px;
        }

        @media (max-width: 650px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .panel,
          .result {
            padding: 22px 18px;
          }
        }
      `}</style>
    </main>
  );
}
