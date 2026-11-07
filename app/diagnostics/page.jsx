"use client";

import { useMemo, useState } from "react";
import { companyCases } from "../../lib/cases";

const EMPTY = {
  industry: "",
  month: "",
  leads: "",
  conversions: "",
  startingCustomers: "",
  lostCustomers: "",
};

const INITIAL_TARGETS = {
  conversion: "10",
  retention: "80",
  minimumSample: "20",
};

const EXAMPLES = {
  weak: {
    industry: "software",
    month: "2026-10",
    leads: "200",
    conversions: "4",
    startingCustomers: "100",
    lostCustomers: "30",
  },

  stronger: {
    industry: "software",
    month: "2026-10",
    leads: "100",
    conversions: "20",
    startingCustomers: "100",
    lostCustomers: "5",
  },
};

const INDUSTRIES = [
  "software",
  "fintech",
  "retail",
  "food",
  "health",
  "education",
  "professional_services",
  "manufacturing",
  "construction",
  "beauty",
  "travel",
  "logistics",
  "hardware",
  "agriculture",
  "childcare",
  "fitness",
  "hospitality",
  "automotive",
  "media",
  "advertising",
  "human_resources",
  "environmental_services",
  "home_services",
  "nonprofit",
];

function numberOrUnknown(value) {
  if (String(value).trim() === "") return null;
  return Number(value);
}

function normalize(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function assessDemand(form, targets) {
  const errors = [];

  const counts = {
    leads: numberOrUnknown(form.leads),
    conversions: numberOrUnknown(form.conversions),
    startingCustomers: numberOrUnknown(form.startingCustomers),
    lostCustomers: numberOrUnknown(form.lostCustomers),
  };

  const names = {
    leads: "Qualified leads",
    conversions: "Paying conversions",
    startingCustomers: "Starting customers",
    lostCustomers: "Lost customers",
  };

  for (const [key, value] of Object.entries(counts)) {
    if (
      value !== null &&
      (!Number.isFinite(value) ||
        !Number.isInteger(value) ||
        value < 0)
    ) {
      errors.push(`${names[key]} must be a nonnegative whole number.`);
    }
  }

  const conversionTarget = numberOrUnknown(targets.conversion);
  const retentionTarget = numberOrUnknown(targets.retention);
  const minimumSample = numberOrUnknown(targets.minimumSample);

  for (const [label, value] of [
    ["Conversion target", conversionTarget],
    ["Retention target", retentionTarget],
  ]) {
    if (
      value === null ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 100
    ) {
      errors.push(`${label} must be between 0 and 100%.`);
    }
  }

  if (
    minimumSample === null ||
    !Number.isInteger(minimumSample) ||
    minimumSample < 1
  ) {
    errors.push("Minimum sample size must be a positive whole number.");
  }

  if (
    counts.leads !== null &&
    counts.conversions !== null &&
    counts.conversions > counts.leads
  ) {
    errors.push(
      "Paying conversions cannot exceed the qualified leads they came from."
    );
  }

  if (
    counts.startingCustomers !== null &&
    counts.lostCustomers !== null &&
    counts.lostCustomers > counts.startingCustomers
  ) {
    errors.push(
      "Lost customers cannot exceed the starting customer cohort."
    );
  }

  if (errors.length) {
    return { errors, metrics: [], warnings: [], status: "Check inputs" };
  }

  const conversion =
    counts.leads > 0 && counts.conversions !== null
      ? (counts.conversions / counts.leads) * 100
      : null;

  const retention =
    counts.startingCustomers > 0 &&
    counts.lostCustomers !== null
      ? (
          (counts.startingCustomers - counts.lostCustomers) /
          counts.startingCustomers
        ) * 100
      : null;

  const metrics = [
    {
      id: "conversion",
      label: "Paid conversion",
      value: conversion,
      sample: counts.leads,
      target: conversionTarget,
      formula:
        "Paying conversions ÷ qualified leads from the same measured funnel.",
      explanation:
        conversion === null
          ? "Enter both counts. A zero lead count does not produce a conversion rate."
          : `${counts.conversions} paying conversions from ${counts.leads} qualified leads.`,
    },

    {
      id: "retention",
      label: "Customer retention",
      value: retention,
      sample: counts.startingCustomers,
      target: retentionTarget,
      formula:
        "(Starting customers − lost customers) ÷ starting customers.",
      explanation:
        retention === null
          ? "Enter the starting cohort and how many of those customers were lost."
          : `${counts.startingCustomers - counts.lostCustomers} of ${
              counts.startingCustomers
            } starting customers remained. Newly acquired customers are excluded.`,
    },
  ].map((metric) => {
    const assessable =
      metric.value !== null &&
      metric.sample >= minimumSample;

    return {
      ...metric,
      assessable,
      flagged: assessable && metric.value < metric.target,

      status:
        metric.value === null
          ? "Not measured"
          : !assessable
            ? "Sample too small"
            : metric.value < metric.target
              ? "Investigate"
              : "No flag against your target",
    };
  });

  const warnings = metrics
    .filter((metric) => metric.flagged)
    .map((metric) => metric.id);

  const assessed = metrics.filter((metric) => metric.assessable).length;

  return {
    errors: [],
    metrics,
    warnings,
    assessed,
    minimumSample,

    status:
      warnings.length > 0
        ? "Investigate demand"
        : assessed === 0
          ? "Insufficient evidence"
          : assessed < metrics.length
            ? "Partial evidence · no flag in measured area"
            : "No flag in supplied demand metrics",
  };
}

function selectHistoricalCases(report, industry) {
  if (!report.warnings.length) return [];

  // These topics are curated from the reviewed company accounts.
  // They are not fitted statistical similarity scores.
  const topics = new Map([
    ["Refolo", ["conversion", "retention"]],
    ["Tandem", ["retention"]],
    ["WePlate", ["conversion"]],
    ["Observa", ["conversion"]],
    ["StarSync", ["conversion"]],
    ["Monite", ["conversion"]],
    ["Young Entrepreneurs Program", ["retention"]],
  ].map(([name, tags]) => [normalize(name), tags]));

  const matches = companyCases
    .filter(
      (item) =>
        !item.analogOnly &&
        !item.identityNeedsReview
    )
    .map((item) => {
      const documentedTopics =
        topics.get(normalize(item.company)) || [];

      const sharedTopics = report.warnings.filter((warning) =>
        documentedTopics.includes(warning)
      );

      const sameIndustry =
        Boolean(industry) && item.industry === industry;

      return {
        ...item,
        sharedTopics,
        sameIndustry,
        points:
          sharedTopics.length * 4 +
          (sameIndustry ? 6 : 0),

        comparison:
          sameIndustry
            ? "Same-sector qualitative context"
            : "Cross-sector analogy",
      };
    })
    .filter((item) => item.sharedTopics.length > 0)
    .sort(
      (a, b) =>
        b.points - a.points ||
        a.company.localeCompare(b.company)
    )
    .slice(0, 2);

  // Include a separately labeled strategy account.
  // Do not claim this company recovered from the same demand problem.
  const strategy = companyCases
    .filter((item) =>
      ["Reform", "Tally"].includes(item.company)
    )
    .sort(
      (a, b) =>
        Number(b.industry === industry) -
          Number(a.industry === industry) ||
        a.company.localeCompare(b.company)
    )[0];

  if (strategy) {
    matches.push({
      ...strategy,
      sharedTopics: [],
      comparison:
        "Related customer-validation strategy · not a proven recovery",
    });
  }

  return matches;
}

export default function DemandDiagnosticsPage() {
  const [form, setForm] = useState({ ...EMPTY });
  const [targets, setTargets] = useState({ ...INITIAL_TARGETS });
  const [isSample, setIsSample] = useState(false);

  const report = useMemo(
    () => assessDemand(form, targets),
    [form, targets]
  );

  const historicalCases = useMemo(
    () => selectHistoricalCases(report, form.industry),
    [report, form.industry]
  );

  function updateField(key, value) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function updateTarget(key, value) {
    setTargets((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function loadExample(name) {
    setForm({ ...EXAMPLES[name] });
    setIsSample(true);
  }

  function clearInputs() {
    setForm({ ...EMPTY });
    setIsSample(false);
  }

  function exportReport() {
    const output = {
      feature: "StartupShield — Demand and retention",
      dataKind: isSample
        ? "Fictional or edited sample"
        : "User-entered",
      inputs: form,
      planningTargets: targets,
      assessment: report,
      historicalCases,
      limitation:
        "Demand signals and qualitative historical context. " +
        "Not proof of product-market fit or a prediction of survival.",
    };

    const blob = new Blob(
      [JSON.stringify(output, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "startupshield-demand-report.json";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="demand-page">
      <header className="hero">
        <a href="/" className="brand">
          startup<i>shield</i> ↗
        </a>

        <p className="eyebrow">PART 1 · DEMAND AND RETENTION</p>

        <h1>
          Are customers
          <br />
          <em>finding the value?</em>
        </h1>

        <p className="intro">
          Measure paid interest and customer retention.
          Understand the gaps. Learn from documented company experiences.
        </p>

        <p className="fine">
          Runs in your browser. No AI key required.
          This page assesses demand—not the health of your entire business.
        </p>
      </header>

      <div className="toolbar">
        <span>TRY FICTIONAL INPUTS</span>

        <button onClick={() => loadExample("weak")}>
          Weak demand
        </button>

        <button onClick={() => loadExample("stronger")}>
          Stronger demand
        </button>

        <button onClick={clearInputs}>
          Clear inputs
        </button>
      </div>

      {isSample && (
        <p className="sample-banner">
          Fictional example or edited sample.
          Clear the inputs before entering a real company.
        </p>
      )}

      <div className="layout">
        <aside className="input-panel">
          <h2>Your evidence.</h2>

          <p className="fine">
            Leave unknown values blank.
            Enter 0 only when zero was observed.
            Use the same measurement month for the counts below.
          </p>

          <label>
            Specific industry
            <select
              value={form.industry}
              onChange={(event) =>
                updateField("industry", event.target.value)
              }
            >
              <option value="">Unknown / choose an industry</option>

              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>

          <label>
            Measurement month
            <input
              type="month"
              value={form.month}
              onChange={(event) =>
                updateField("month", event.target.value)
              }
            />
          </label>

          <h3>Paid interest</h3>

          <p className="fine">
            Count paying conversions from the same measured group
            of qualified leads. Do not mix unrelated customers
            with this funnel.
          </p>

          <label>
            Qualified leads
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Unknown"
              value={form.leads}
              onChange={(event) =>
                updateField("leads", event.target.value)
              }
            />
          </label>

          <label>
            Paying conversions from those leads
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Unknown"
              value={form.conversions}
              onChange={(event) =>
                updateField("conversions", event.target.value)
              }
            />
          </label>

          <h3>Customer retention</h3>

          <p className="fine">
            Follow customers present at the start of the month.
            Exclude newly acquired customers from both counts.
          </p>

          <label>
            Customers in the starting cohort
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Unknown"
              value={form.startingCustomers}
              onChange={(event) =>
                updateField(
                  "startingCustomers",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Customers lost from that cohort
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Unknown"
              value={form.lostCustomers}
              onChange={(event) =>
                updateField(
                  "lostCustomers",
                  event.target.value
                )
              }
            />
          </label>

          <details>
            <summary>Set your planning targets</summary>

            <p className="fine">
              These defaults are illustrative—not industry averages
              or validated failure thresholds.
              Choose targets appropriate to your business.
            </p>

            <label>
              Minimum paid conversion (%)
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={targets.conversion}
                onChange={(event) =>
                  updateTarget(
                    "conversion",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Minimum cohort retention (%)
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={targets.retention}
                onChange={(event) =>
                  updateTarget(
                    "retention",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Minimum observations for a directional flag
              <input
                type="number"
                min="1"
                step="1"
                value={targets.minimumSample}
                onChange={(event) =>
                  updateTarget(
                    "minimumSample",
                    event.target.value
                  )
                }
              />
            </label>
          </details>

          <p className="fine">
            Results update as you type.
            Inputs stay in this page session.
            Refreshing clears them; export to keep a copy.
          </p>
        </aside>

        <main className="results" aria-live="polite">
          {report.errors.length > 0 ? (
            <div className="error">
              <h2>Check these inputs.</h2>

              <ul>
                {report.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div className="report-heading">
                <div>
                  <p className="eyebrow">YOUR DEMAND BRIEF</p>
                  <h2>{report.status}</h2>
                  <p className="fine">
                    {form.month || "Measurement month not set"}
                    {" · "}
                    {report.assessed} of 2 metrics assessable
                  </p>
                </div>

                <button onClick={exportReport}>
                  Export report ↗
                </button>
              </div>

              <div className="metrics">
                {report.metrics.map((metric) => (
                  <article
                    key={metric.id}
                    className={
                      metric.flagged
                        ? "metric flagged"
                        : "metric"
                    }
                  >
                    <p className="eyebrow">{metric.label}</p>

                    <strong>
                      {metric.value === null
                        ? "—"
                        : `${metric.value.toFixed(1)}%`}
                    </strong>

                    <span className="status">
                      {metric.status}
                    </span>

                    <p>{metric.explanation}</p>

                    <p className="fine">
                      {metric.formula}
                    </p>

                    <p className="fine">
                      Your target: {metric.target}%.
                      Minimum observations: {report.minimumSample}.
                    </p>
                  </article>
                ))}
              </div>

              <article className="brief">
                <p className="eyebrow">WHAT THE EVIDENCE SAYS</p>

                {report.warnings.includes("conversion") && (
                  <p>
                    <b>Paid interest needs investigation.</b>{" "}
                    Conversion is below your selected target.
                    Investigate whether the issue is buyer fit,
                    the value proposition, price, or the acquisition channel.
                  </p>
                )}

                {report.warnings.includes("retention") && (
                  <p>
                    <b>Retention needs investigation.</b>{" "}
                    Too few starting-cohort customers remained
                    relative to your selected target.
                    Ask lost customers what changed and where
                    the product failed to provide value.
                  </p>
                )}

                {!report.warnings.length && (
                  <p>
                    {report.assessed === 0
                      ? "There is not enough evidence to make a directional assessment yet."
                      : "The assessable metrics do not fall below your selected targets. This does not establish product-market fit or overall business health."}
                  </p>
                )}

                {report.assessed < 2 && (
                  <p className="fine">
                    At least one metric is missing, has a zero
                    denominator, or has fewer observations than
                    your minimum. That area remains unassessed.
                  </p>
                )}

                <p className="fine">
                  These measurements identify questions to investigate.
                  They do not establish the cause of weak demand.
                </p>
              </article>

              <article className="next">
                <p className="eyebrow">NEXT INVESTIGATION</p>

                <h3>Find out where value breaks down.</h3>

                <ol>
                  <li>
                    Interview recent non-buyers and lost customers
                    separately. Record reasons rather than assuming them.
                  </li>

                  <li>
                    Compare customer segments and acquisition channels
                    using the same funnel definitions.
                  </li>

                  <li>
                    Test one change to the offer, onboarding,
                    or target customer. Track conversion and retention
                    without changing every variable at once.
                  </li>
                </ol>

                <p className="fine">
                  This is an experiment to investigate—not a
                  guaranteed intervention. The current aggregate
                  inputs do not identify your best or worst customer segment.
                </p>
              </article>

              <section className="historical">
                <p className="eyebrow">HISTORICAL CONTEXT</p>

                <h2>Other chapters.<br /><em>Useful perspective.</em></h2>

                {historicalCases.length > 0 ? (
                  historicalCases.map((item) => (
                    <article className="story" key={item.id}>
                      <p className="eyebrow">{item.comparison}</p>

                      <h3>{item.company}</h3>

                      {item.sharedTopics.length > 0 && (
                        <p className="fine">
                          Related issue: {item.sharedTopics.join(", ")}
                        </p>
                      )}

                      <dl>
                        <dt>DOCUMENTED SITUATION</dt>
                        <dd>{item.problem}</dd>

                        <dt>WHAT THEY REPORTED DOING</dt>
                        <dd>{item.response}</dd>

                        <dt>REPORTED OUTCOME</dt>
                        <dd>{item.outcome}</dd>
                      </dl>

                      <p className="limitations">
                        {item.limitation}
                      </p>

                      <a
                        href={item.sourceUrl || item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read original source ↗
                      </a>

                      {(item.followupUrl || item.followup) && (
                        <a
                          href={item.followupUrl || item.followup}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {" "}Follow-up ↗
                        </a>
                      )}
                    </article>
                  ))
                ) : (
                  <p className="empty">
                    {report.warnings.length > 0
                      ? "No relevant reviewed case was found in the connected library. Check that lib/cases.js is connected to your 100-case file."
                      : "An intervention analogy is selected only when the supplied demand metrics trigger a warning."}
                  </p>
                )}

                <p className="fine">
                  Matching uses reviewed topics and the selected sector.
                  It is not statistical similarity. Historical actions
                  may have failed, and reported improvements do not
                  establish causation.
                </p>
              </section>
            </>
          )}
        </main>
      </div>

      <style jsx>{`
        .demand-page {
          min-height: 100vh;
          padding: 30px clamp(18px, 4vw, 70px) 70px;
          background: #f8f7f3;
          color: #34372f;
          font: 15px/1.65 Arial, sans-serif;
        }

        .demand-page * {
          box-sizing: border-box;
        }

        .hero {
          max-width: 900px;
          margin: 0 auto 45px;
          text-align: center;
        }

        .brand {
          color: #34372f;
          text-decoration: none;
          font: 27px Georgia, serif;
        }

        .hero h1 {
          margin: 30px 0 22px;
          font: normal clamp(48px, 7vw, 86px)/1.06 Georgia, serif;
          letter-spacing: -2px;
        }

        .intro {
          max-width: 640px;
          margin: 0 auto 15px;
          font-size: 19px;
          color: #70756a;
        }

        .eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: #173fb8;
        }

        .fine {
          font-size: 12px;
          color: #74796e;
        }

        .toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 20px 0;
          margin-bottom: 26px;
          border-top: 1px solid #dcdfd3;
          border-bottom: 1px solid #dcdfd3;
        }

        .toolbar > span {
          margin-right: 10px;
          font-size: 10px;
          letter-spacing: 1px;
        }

        button {
          padding: 10px 17px;
          border: 1px solid #d1d5c8;
          border-radius: 30px;
          background: transparent;
          color: #34372f;
          font: inherit;
          cursor: pointer;
        }

        button:hover {
          background: #eaece3;
        }

        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        summary:focus-visible,
        a:focus-visible {
          outline: 3px solid #7087db;
          outline-offset: 3px;
        }

        .sample-banner {
          padding: 14px 18px;
          border: 1px solid #e8d8b7;
          border-radius: 9px;
          background: #f5ecd9;
          font-size: 12px;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(260px, 330px) minmax(0, 1fr);
          gap: 40px;
          max-width: 1400px;
          margin: auto;
        }

        .input-panel {
          padding-right: 28px;
          border-right: 1px solid #dcdfd3;
        }

        h2 {
          margin: 12px 0 18px;
          font: normal 34px/1.15 Georgia, serif;
        }

        h3 {
          margin: 25px 0 12px;
          font: normal 26px/1.2 Georgia, serif;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin: 17px 0;
          color: #6b7262;
          font-size: 12px;
        }

        input,
        select {
          width: 100%;
          padding: 12px;
          border: 1px solid #d5d9cd;
          border-radius: 8px;
          background: #fffefa;
          color: #34372f;
          font: inherit;
        }

        input::placeholder {
          color: #9a9e91;
        }

        details {
          margin-top: 25px;
          padding-top: 18px;
          border-top: 1px solid #dcdfd3;
        }

        summary {
          cursor: pointer;
          font-size: 13px;
        }

        .results {
          min-width: 0;
        }

        .report-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .report-heading button {
          white-space: nowrap;
        }

        .metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .metric,
        .brief,
        .next,
        .story {
          padding: 25px;
          margin: 20px 0;
          border: 1px solid #dcded4;
          border-radius: 12px;
          background: #fffefa;
        }

        .metric {
          margin: 10px 0 20px;
        }

        .metric.flagged {
          border-color: #d9bca0;
          background: #fcf7ee;
        }

        .metric strong {
          display: block;
          margin: 12px 0;
          font: normal 51px/1 Georgia, serif;
        }

        .metric p {
          font-size: 12px;
        }

        .status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          background: #eceee5;
          font-size: 10px;
        }

        .flagged .status {
          background: #f0e0c7;
          color: #855e26;
        }

        .brief,
        .next {
          background: #eef1fa;
          border-color: #dce2f3;
        }

        .next li {
          margin: 12px 0;
          font-size: 13px;
        }

        .historical {
          margin-top: 38px;
        }

        .story h3 {
          margin-top: 8px;
          font-size: 31px;
        }

        dt {
          margin-top: 17px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        dd {
          margin: 5px 0;
          color: #68715e;
          font-size: 13px;
        }

        .limitations {
          padding: 15px;
          border-radius: 8px;
          background: #f0f1e9;
          color: #727869;
          font-size: 12px;
        }

        .story a {
          color: #173fb8;
          font-size: 12px;
          text-decoration: underline;
        }

        .empty {
          padding: 24px;
          border: 1px dashed #d3d8c8;
          border-radius: 10px;
          color: #72796a;
          font-size: 13px;
        }

        .error {
          padding: 25px;
          border: 1px solid #e2b7b7;
          border-radius: 12px;
          background: #fbefef;
        }

        @media (max-width: 900px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .input-panel {
            padding-right: 0;
            border-right: 0;
          }
        }

        @media (max-width: 560px) {
          .metrics {
            grid-template-columns: 1fr;
          }

          .report-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .metric,
          .brief,
          .next,
          .story {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
