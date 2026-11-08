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

  startingCustomers: "",
  lostCustomers: "",
  churnTarget: "5",

  milestonesDue: "",
  milestonesCompleted: "",

  alternatives: "",
  differentiation: "",
  advantageEvidence: "unknown",

  interviews: "",
  preferenceVotes: "",
};

const example = {
  industry: "Software / AI",

  prospects: "200",
  buyers: "4",
  conversionTarget: "5",

  cash: "30000",
  revenue: "10000",
  fixedCosts: "12000",
  variableCosts: "6000",
  runwayTarget: "6",

  units: "100",
  marginTarget: "50",

  startingCustomers: "100",
  lostCustomers: "12",
  churnTarget: "5",

  milestonesDue: "8",
  milestonesCompleted: "5",

  alternatives:
    "A spreadsheet; an established software provider; doing the work manually.",
  differentiation:
    "Our proposed advantage is reducing weekly administrative work.",
  advantageEvidence: "unknown",

  interviews: "10",
  preferenceVotes: "2",
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

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function numeric(data, key, options = {}) {
  const raw = data[key];

  if (raw == null || String(raw).trim() === "") {
    return null;
  }

  const value = Number(raw);

  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1e12 ||
    (options.integer && !Number.isInteger(value)) ||
    (options.percent && value > 100) ||
    (options.positive && value <= 0)
  ) {
    throw new Error(
      `Check the value entered for "${key}". Use a valid nonnegative ` +
        `number${options.integer ? " with no decimal places" : ""}.`
    );
  }

  return value;
}

function assess(data) {
  const n = (key, options) => numeric(data, key, options);
  const findings = [];

  function add(area, status, title, finding, next, tags = []) {
    findings.push({
      area,
      status,
      title,
      finding,
      next,
      tags,
    });
  }

  // 1. DEMAND
  const prospects = n("prospects", { integer: true });
  const buyers = n("buyers", { integer: true });
  const conversionTarget = n("conversionTarget", {
    percent: true,
    positive: true,
  });

  if (
    prospects !== null &&
    buyers !== null &&
    buyers > prospects
  ) {
    throw new Error(
      "Paying buyers cannot exceed qualified prospects in the same group."
    );
  }

  if (
    prospects === null ||
    buyers === null ||
    conversionTarget === null ||
    prospects === 0
  ) {
    add(
      "Demand",
      "unknown",
      "Demand needs more evidence",
      "Enter prospects, paying buyers, and a conversion target from the same group and period.",
      "Run a defined sales or paid-pilot test and record who actually pays."
    );
  } else {
    const conversion = (buyers / prospects) * 100;

    // A demonstration guard, not a statistically validated cutoff.
    const smallSample = prospects < 20;
    const belowTarget = conversion < conversionTarget;

    add(
      "Demand",
      smallSample ? "unknown" : belowTarget ? "attention" : "target",
      smallSample
        ? "An early demand signal"
        : belowTarget
          ? "Paid conversion is below your target"
          : "Paid conversion meets your target",
      `${buyers} of ${prospects} qualified prospects paid: ` +
        `${conversion.toFixed(1)}% conversion versus your ` +
        `${conversionTarget}% target. ` +
        (smallSample
          ? "This prototype leaves samples below 20 prospects unclassified."
          : "This describes this group, not total market demand."),
      belowTarget
        ? "Record rejection reasons and test one change to your offer, audience, or price."
        : "Repeat the test with a comparable group and measure whether customers stay.",
      !smallSample && belowTarget ? ["demand", "conversion"] : []
    );
  }

  // 2. CASH
  const cash = n("cash");
  const revenue = n("revenue");
  const fixedCosts = n("fixedCosts");
  const variableCosts = n("variableCosts");
  const runwayTarget = n("runwayTarget", { positive: true });

  const hasMonthlyFinancials = [
    revenue,
    fixedCosts,
    variableCosts,
  ].every(value => value !== null);

  if (
    !hasMonthlyFinancials ||
    cash === null ||
    runwayTarget === null
  ) {
    add(
      "Cash",
      "unknown",
      "Cash outlook is incomplete",
      "Enter available cash, monthly revenue, both expense categories, and your runway target.",
      "Use actual cash receipts and payments where possible; record large upcoming bills separately."
    );
  } else {
    const expenses = fixedCosts + variableCosts;
    const burn = expenses - revenue;

    if (burn > 0) {
      const runway = cash / burn;
      const short = runway < runwayTarget;

      add(
        "Cash",
        short ? "attention" : "target",
        short
          ? "Cash runway is below your target"
          : "Cash runway meets your target",
        `Monthly spending exceeds revenue by ${money(burn)}. ` +
          `${money(cash)} of cash covers approximately ` +
          `${runway.toFixed(1)} months versus your ` +
          `${runwayTarget}-month target.`,
        "Compare a spending reduction with a revenue downside scenario. Include payment timing and upcoming bills.",
        short ? ["cash", "burn"] : []
      );
    } else {
      add(
        "Cash",
        cash === 0 ? "attention" : "target",
        cash === 0
          ? "There is no starting cash cushion"
          : "No monthly net burn at these levels",
        `Monthly revenue minus entered expenses is ${money(-burn)}. ` +
          "A burn-based runway estimate does not apply when this amount is nonnegative.",
        "Check payment delays, seasonality, taxes, debt payments, and cash reserves.",
        cash === 0 ? ["cash"] : []
      );
    }
  }

  // 3. PRICING / UNIT ECONOMICS
  const units = n("units", { integer: true });
  const marginTarget = n("marginTarget", {
    percent: true,
    positive: true,
  });

  if (
    !hasMonthlyFinancials ||
    units === null ||
    units === 0 ||
    revenue === 0 ||
    marginTarget === null
  ) {
    add(
      "Pricing",
      "unknown",
      "Unit economics need more evidence",
      "Enter positive revenue, units sold, monthly variable costs, fixed costs, and your margin target.",
      "Choose one consistent unit, such as an order, subscription-month, or completed job."
    );
  } else {
    const averagePrice = revenue / units;
    const variablePerUnit = variableCosts / units;
    const contribution = averagePrice - variablePerUnit;
    const margin = ((revenue - variableCosts) / revenue) * 100;
    const belowTarget = margin < marginTarget;

    const breakEven =
      contribution > 0
        ? `${Math.ceil(fixedCosts / contribution).toLocaleString()} units per month`
        : "not achievable at the entered price and variable cost";

    add(
      "Pricing",
      belowTarget ? "attention" : "target",
      contribution <= 0
        ? "Each unit has no positive contribution"
        : belowTarget
          ? "Contribution margin is below your target"
          : "Contribution margin meets your target",
      `Average revenue per unit: ${money(averagePrice)}. ` +
        `Variable cost per unit: ${money(variablePerUnit)}. ` +
        `Contribution margin: ${margin.toFixed(1)}% versus your ` +
        `${marginTarget}% target. Break-even: ${breakEven}.`,
      "Test a price or delivery-cost change. Include possible customer loss and all costs that rise with sales.",
      belowTarget ? ["pricing", "margin", "unit_economics"] : []
    );
  }

  // 4. COMPETITION
  const interviews = n("interviews", { integer: true });
  const preferenceVotes = n("preferenceVotes", {
    integer: true,
  });

  if (
    interviews !== null &&
    preferenceVotes !== null &&
    preferenceVotes > interviews
  ) {
    throw new Error(
      "Buyers preferring your offer cannot exceed buyers interviewed."
    );
  }

  const comparisonReady =
    data.alternatives.trim() &&
    data.differentiation.trim();

  let preferenceText = "";

  if (
    interviews !== null &&
    interviews > 0 &&
    preferenceVotes !== null
  ) {
    preferenceText =
      ` In your supplied comparison, ${preferenceVotes} of ` +
      `${interviews} interviewed buyers preferred your offer. ` +
      "Stated preference is not a purchase.";
  }

  if (!comparisonReady) {
    add(
      "Competition",
      "unknown",
      "Your competitive comparison is incomplete",
      "List the alternatives buyers use and describe your proposed advantage.",
      "Include direct competitors, manual work, spreadsheets, and doing nothing."
    );
  } else if (data.advantageEvidence === "unsupported") {
    add(
      "Competition",
      "attention",
      "Your proposed advantage lacks buyer support",
      "You reported testing the advantage without finding supporting buyer evidence." +
        preferenceText,
      "Ask buyers what would make them switch, then test a revised offer against their current alternative.",
      ["competition", "differentiation"]
    );
  } else if (data.advantageEvidence === "supported") {
    add(
      "Competition",
      "evidence",
      "You report evidence supporting your advantage",
      "Your comparison and supporting evidence are self-reported; this app has not verified competitors or sources." +
        preferenceText,
      "Check competitor claims against dated sources and test whether preference leads to paid switching."
    );
  } else {
    add(
      "Competition",
      "unknown",
      "Differentiation is still a hypothesis",
      "You described an advantage but have not yet established buyer support." +
        preferenceText,
      "Show comparable offers to target buyers and record their choices and reasons."
    );
  }

  // 5. RETENTION AND EXECUTION
  const starting = n("startingCustomers", { integer: true });
  const lost = n("lostCustomers", { integer: true });
  const churnTarget = n("churnTarget", { percent: true });

  const due = n("milestonesDue", { integer: true });
  const completed = n("milestonesCompleted", {
    integer: true,
  });

  if (starting !== null && lost !== null && lost > starting) {
    throw new Error(
      "Lost customers cannot exceed the customers present at the start of the month."
    );
  }

  if (due !== null && completed !== null && completed > due) {
    throw new Error(
      "Completed milestones cannot exceed milestones due in the same group."
    );
  }

  const retentionKnown =
    starting !== null &&
    starting > 0 &&
    lost !== null &&
    churnTarget !== null;

  const executionKnown =
    due !== null && due > 0 && completed !== null;

  const churn = retentionKnown ? (lost / starting) * 100 : null;
  const missed = executionKnown ? due - completed : null;

  const retentionFlag =
    retentionKnown && churn > churnTarget;

  const executionFlag =
    executionKnown && missed > 0;

  const operationalTags = [
    ...(retentionFlag ? ["retention"] : []),
    ...(executionFlag ? ["execution", "scaling"] : []),
  ];

  const operationalText = [
    retentionKnown
      ? `${lost} of ${starting} starting customers left: ` +
        `${churn.toFixed(1)}% monthly customer churn versus your ` +
        `${churnTarget}% maximum target.`
      : "Retention cannot be assessed from the supplied inputs.",

    executionKnown
      ? `${completed} of ${due} due milestones were completed; ` +
        `${missed} were missed. Milestone counts do not capture their importance.`
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
    operationalTags
  );

  return findings;
}

const industryWords = {
  "Software / AI": ["software", "saas", "ai"],
  "Retail / Ecommerce": ["retail", "ecommerce", "e-commerce"],
  "Food / Hospitality": ["food", "restaurant", "hospitality"],
  "Professional services": ["professional", "services"],
  Healthcare: ["health", "medical"],
  Education: ["education", "learning"],
  Manufacturing: ["manufacturing", "hardware"],
  Other: [],
};

function selectCases(finding, industry) {
  if (!finding.tags.length) return [];

  const words = industryWords[industry] || [];

  return companyCases
    .filter(item => !item.analogOnly && !item.identityNeedsReview)
    .map(item => {
      const tags = Array.isArray(item.tags) ? item.tags : [];

      const matched = tags.filter(tag =>
        finding.tags.includes(tag)
      );

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
        a.company.localeCompare(b.company)
    )
    .slice(0, 2);
}

function safeSource(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

const statusLabels = {
  attention: "Investigate",
  target: "Entered target met",
  unknown: "More evidence needed",
  evidence: "Self-reported evidence",
};

export default function CheckupPage() {
  const [form, setForm] = useState(initial);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [fictional, setFictional] = useState(false);

  function update(key, value) {
    setForm(previous => ({ ...previous, [key]: value }));

    // Avoid displaying an assessment for outdated inputs.
    setReport(null);
    setError("");
  }

  function submit(event) {
    event.preventDefault();
    setError("");

    try {
      setReport({
        findings: assess(form),
        industry: form.industry,
        fictional,
      });
    } catch (err) {
      setReport(null);
      setError(err.message);
    }
  }

  function field(label, key, options = {}) {
    return (
      <label className="field" key={key}>
        <span>{label}</span>
        <input
          type="number"
          min={options.positive ? "0.01" : "0"}
          max={options.percent ? "100" : undefined}
          step={options.integer ? "1" : "any"}
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
        <a href="/" className="brand">
          StartupShield
        </a>

        <p className="eyebrow">LESS GUESSWORK. BETTER QUESTIONS.</p>

        <h1>
          Your business.
          <br />
          <em>A closer look.</em>
        </h1>

        <p className="intro">
          Check five areas of startup risk using your own evidence.
          Explore related company experiences and decide what to test next.
        </p>

        <p className="small">
          Runs locally in your browser without an AI API. This page
          does not intentionally save or send your form entries.
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
          <h2>Start with the context.</h2>

          <label className="field">
            <span>Industry</span>
            <select
              value={form.industry}
              onChange={event =>
                update("industry", event.target.value)
              }
            >
              {industries.map(industry => (
                <option key={industry}>{industry}</option>
              ))}
            </select>
          </label>

          <p className="small">
            Use USD and one consistent month for financial,
            retention, and milestone inputs. Demand inputs must
            describe one defined group over the same period.
            Leave unavailable numbers blank.
          </p>

          <p className="small">
            Targets below are editable planning assumptions,
            not validated industry benchmarks or failure predictors.
          </p>

          {fictional && (
            <p className="notice">
              Fictional example loaded. Its numbers and customer
              claims are demonstration data.
            </p>
          )}
        </section>

        <section className="panel">
          <p className="eyebrow">01 / DEMAND</p>
          <h2>Are people paying?</h2>

          <div className="grid">
            {field("Qualified prospects in the group", "prospects", {
              integer: true,
            })}
            {field("Prospects who became paying buyers", "buyers", {
              integer: true,
            })}
            {field("Your target conversion (%)", "conversionTarget", {
              percent: true,
              positive: true,
            })}
          </div>

          <p className="small">
            Count unique prospects and buyers, not visits or
            transactions. Choose the group before reviewing its results.
          </p>
        </section>

        <section className="panel">
          <p className="eyebrow">02 / CASH</p>
          <h2>How much room do you have?</h2>

          <div className="grid">
            {field("Available cash ($)", "cash")}
            {field("Monthly revenue ($)", "revenue")}
            {field("Monthly fixed cash costs ($)", "fixedCosts")}
            {field("Monthly variable cash costs ($)", "variableCosts")}
            {field("Your runway target (months)", "runwayTarget", {
              positive: true,
            })}
          </div>

          <p className="small">
            Enter every cost once. Fixed costs stay broadly constant;
            variable costs increase with sales. The estimate assumes
            revenue is collected and expenses are paid in the same month,
            with unchanged monthly levels.
          </p>
        </section>

        <section className="panel">
          <p className="eyebrow">03 / PRICING</p>
          <h2>Does each sale contribute enough?</h2>

          <div className="grid">
            {field("Units sold during that month", "units", {
              integer: true,
            })}
            {field("Your contribution margin target (%)", "marginTarget", {
              percent: true,
              positive: true,
            })}
          </div>

          <p className="small">
            Uses the revenue and expense inputs above. A unit could be
            one order, completed job, or subscription-month. Blended
            averages can hide differences between products and customers.
          </p>
        </section>

        <section className="panel">
          <p className="eyebrow">04 / COMPETITION</p>
          <h2>Why would a buyer choose you?</h2>

          <label className="field">
            <span>What alternatives do your buyers currently use?</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={form.alternatives}
              onChange={event =>
                update("alternatives", event.target.value)
              }
              placeholder="Names, prices, features, and dated source URLs if available."
            />
          </label>

          <label className="field">
            <span>What is your proposed advantage?</span>
            <textarea
              rows={3}
              maxLength={1500}
              value={form.differentiation}
              onChange={event =>
                update("differentiation", event.target.value)
              }
              placeholder="Describe the specific benefit you intend to test."
            />
          </label>

          <label className="field">
            <span>What have you established about this advantage?</span>
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
            {field("Buyers shown comparable alternatives", "interviews", {
              integer: true,
            })}
            {field("Those buyers who preferred your offer", "preferenceVotes", {
              integer: true,
            })}
          </div>

          <p className="small">
            This is a guided, self-reported comparison. The code does
            not search the web, interpret your paragraphs, or verify
            competitor claims. Interview preference does not prove demand.
          </p>
        </section>

        <section className="panel">
          <p className="eyebrow">05 / RETENTION & EXECUTION</p>
          <h2>Do customers stay? Does the team deliver?</h2>

          <div className="grid">
            {field("Paying customers at the start of the month", "startingCustomers", {
              integer: true,
            })}
            {field("Customers from that starting group who left", "lostCustomers", {
              integer: true,
            })}
            {field("Your maximum monthly churn target (%)", "churnTarget", {
              percent: true,
            })}
            {field("Milestones due during the month", "milestonesDue", {
              integer: true,
            })}
            {field("Those milestones completed by their deadlines", "milestonesCompleted", {
              integer: true,
            })}
          </div>

          <p className="small">
            Customer churn is most useful for recurring businesses.
            For one-time purchases, leave it blank and track repeat
            purchasing separately. Define milestones before the period;
            missed milestones are prompts for review, not proof of failure.
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
          <p className="eyebrow">YOUR CHECKUP</p>
          <h2>Here is what your evidence says.</h2>

          {report.fictional && (
            <p className="notice">
              This report uses fictional demonstration inputs.
            </p>
          )}

          <p className="small">
            Each result assesses only the entered measures. Meeting
            a target does not establish overall business health.
          </p>

          {report.findings.map(finding => {
            const matches = selectCases(
              finding,
              report.industry
            );

            return (
              <article className="result" key={finding.area}>
                <div className="resultHeader">
                  <p className="eyebrow">{finding.area}</p>
                  <span className={`badge ${finding.status}`}>
                    {statusLabels[finding.status]}
                  </span>
                </div>

                <h3>{finding.title}</h3>
                <p>{finding.finding}</p>

                <div className="next">
                  <strong>Next investigation</strong>
                  <p>{finding.next}</p>
                </div>

                {matches.length > 0 ? (
                  <div className="cases">
                    <h4>Related historical experiences</h4>

                    {matches.map(item => {
                      const source = safeSource(
                        item.sourceUrl || item.url
                      );

                      return (
                        <div className="case" key={item.id}>
                          <h4>{item.company}</h4>

                          <p className="small">
                            Shared tags: {item.matched.join(", ")}.
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
                              "Different companies, markets, and time periods may make this comparison unsuitable."}
                          </p>

                          {source && (
                            <a
                              href={source}
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
                    {finding.tags.length
                      ? "No eligible historical case shares these risk tags in the current library."
                      : "No risk-based historical match selected for this result."}
                  </p>
                )}
              </article>
            );
          })}

          <p className="small">
            Historical matching uses shared tags and approximate industry
            metadata, not statistical similarity. Reported responses
            and outcomes do not establish causation. This checkup does
            not predict failure or guarantee that an intervention works.
          </p>
        </section>
      )}

      <footer>
        <a href="/">← Back to StartupShield</a>
      </footer>

      <style jsx>{`
        .checkup {
          min-height: 100vh;
          background: #f8f7f3;
          color: #34372f;
          padding: 36px max(22px, calc((100vw - 1000px) / 2)) 70px;
          font-family: Arial, sans-serif;
          line-height: 1.65;
        }

        .brand {
          font-family: Georgia, serif;
          font-size: 27px;
          font-style: italic;
          color: inherit;
          text-decoration: none;
        }

        .hero {
          padding: 0 0 45px;
        }

        .eyebrow {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 20px 0 12px;
        }

        h1,
        h2,
        h3 {
          font-family: Georgia, serif;
          font-weight: 400;
          line-height: 1.1;
        }

        h1 {
          font-size: clamp(52px, 8vw, 88px);
          letter-spacing: -3px;
          margin: 20px 0;
        }

        h2 {
          font-size: clamp(29px, 4vw, 41px);
          margin: 12px 0 24px;
        }

        h3 {
          font-size: 31px;
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
          padding: 30px;
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
        }

        input,
        textarea,
        select {
          box-sizing: border-box;
          width: 100%;
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
          margin-top: 70px;
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
          margin-top: 45px;
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

          h1 {
            letter-spacing: -2px;
          }
        }
      `}</style>
    </main>
  );
}
