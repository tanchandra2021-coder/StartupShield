"use client";

import { useMemo, useState } from "react";
import { companyCases, matchCases } from "../lib/cases";

const SAMPLE = {
  name: "Sunday Studio",
  industry: "Software / AI",
  cash: 42000,
  revenue: 16000,
  payroll: 12000,
  operations: 3500,
  marketing: 4000,
  aiCosts: 3500,
  growth: 2,
  churn: 4,
  customers: 160,
  concentration: 18,
};

const DEFAULT_SCENARIO = {
  price: 0,
  cost: 0,
  ai: 0,
  loss: 0,
};

const FIELDS = [
  ["cash", "Cash on hand ($)"],
  ["revenue", "Monthly revenue ($)"],
  ["payroll", "Monthly payroll ($)"],
  ["operations", "Monthly operations ($)"],
  ["marketing", "Monthly marketing ($)"],
  ["aiCosts", "Monthly AI / API costs ($)"],
  ["growth", "Net revenue growth (% per month)"],
  ["churn", "Monthly customer churn (%)"],
  ["customers", "Paying customers"],
  ["concentration", "Largest customer (% of revenue)"],
];

const SCENARIO_FIELDS = [
  ["price", "Price change", -20, 50],
  ["cost", "General expense reduction", 0, 50],
  ["ai", "AI cost reduction", 0, 80],
  ["loss", "Customer loss", 0, 50],
];

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseProfile(inputs) {
  const profile = {
    name: inputs.name.trim() || "My business",
    industry: inputs.industry,
  };

  for (const [key, label] of FIELDS) {
    const raw = inputs[key];

    if (
      raw === "" ||
      raw === null ||
      raw === undefined ||
      String(raw).trim() === ""
    ) {
      throw new Error(`Enter ${label.toLowerCase()}.`);
    }

    const value = Number(raw);
    const minimum = key === "growth" ? -50 : 0;

    const maximum = [
      "growth",
      "churn",
      "concentration",
    ].includes(key)
      ? 100
      : 10_000_000_000;

    if (
      !Number.isFinite(value) ||
      value < minimum ||
      value > maximum
    ) {
      throw new Error(
        `${label} must be between ${minimum} and ${maximum}.`
      );
    }

    if (key === "customers" && !Number.isInteger(value)) {
      throw new Error("Paying customers must be a whole number.");
    }

    profile[key] = value;
  }

  return profile;
}

function calculateForecast(profile, scenario = DEFAULT_SCENARIO) {
  const firstMonthRevenue =
    profile.revenue *
    (1 + scenario.price / 100) *
    (1 - scenario.loss / 100);

  const fixedExpenses =
    (
      profile.payroll +
      profile.operations +
      profile.marketing
    ) *
    (1 - scenario.cost / 100);

  const firstMonthAI =
    profile.aiCosts *
    (1 - scenario.ai / 100);

  const expenses = fixedExpenses + firstMonthAI;
  const net = firstMonthRevenue - expenses;

  const series = [
    {
      month: 0,
      cash: profile.cash,
      revenue: 0,
      expenses: 0,
    },
  ];

  let cash = profile.cash;
  let runway = profile.cash === 0 ? 0 : null;

  for (let month = 1; month <= 24; month++) {
    const growthFactor =
      Math.pow(1 + profile.growth / 100, month - 1);

    const revenue = firstMonthRevenue * growthFactor;

    const monthlyExpenses =
      fixedExpenses + firstMonthAI * growthFactor;

    const previousCash = cash;
    cash += revenue - monthlyExpenses;

    if (
      runway === null &&
      cash <= 0 &&
      cash < previousCash
    ) {
      runway =
        month - 1 +
        previousCash / (previousCash - cash);
    }

    series.push({
      month,
      cash,
      revenue,
      expenses: monthlyExpenses,
    });
  }

  const warnings = [];

  if (runway !== null && runway < 6) {
    warnings.push({
      id: "cash",
      title: "Your cash cushion needs attention",
      detail:
        profile.cash === 0
          ? "No starting cash buffer is reported. Review payment timing and immediate obligations."
          : `Cash reaches zero in approximately ${runway.toFixed(
              1
            )} months under the entered assumptions.`,
    });
  }

  if (net < 0) {
    warnings.push({
      id: "burn",
      title: "Expenses exceed first-month revenue",
      detail: `The modeled first month has ${money(
        -net
      )} more going out than coming in.`,
    });
  }

  if (
    profile.revenue > 0 &&
    profile.aiCosts / profile.revenue > 0.15
  ) {
    warnings.push({
      id: "ai",
      title: "AI usage deserves a closer look",
      detail: `AI costs equal ${(
        (profile.aiCosts / profile.revenue) *
        100
      ).toFixed(
        1
      )}% of entered revenue. Review usage by customer group.`,
    });
  }

  if (profile.churn > 5) {
    warnings.push({
      id: "retention",
      title: "Investigate customer retention",
      detail: `You entered ${profile.churn}% monthly churn. Review cohorts and cancellation reasons.`,
    });
  }

  if (profile.concentration > 30) {
    warnings.push({
      id: "concentration",
      title: "Revenue depends heavily on one customer",
      detail: `Your largest customer represents ${profile.concentration}% of revenue. Explore a revenue-loss scenario.`,
    });
  }

  return {
    revenue: firstMonthRevenue,
    expenses,
    net,
    burn: Math.max(0, -net),
    runway,
    series,
    warnings,
  };
}

function runwayLabel(report) {
  return report.runway === null
    ? "24+"
    : report.runway.toFixed(1);
}

function Chart({ baseline, alternative = null }) {
  const width = 720;
  const height = 260;
  const left = 75;
  const right = 20;
  const top = 20;
  const bottom = 35;

  const base = baseline.series.slice(0, 13);
  const changed = alternative?.series.slice(0, 13) || [];

  const balances = [
    ...base.map((point) => point.cash),
    ...changed.map((point) => point.cash),
    0,
  ];

  const low = Math.min(...balances);
  const high = Math.max(...balances, 1);
  const padding = Math.max((high - low) * 0.08, 1);
  const minimum = low - padding;
  const maximum = high + padding;

  const x = (month) =>
    left + (month / 12) * (width - left - right);

  const y = (cash) =>
    top +
    ((maximum - cash) / (maximum - minimum)) *
      (height - top - bottom);

  const points = (series) =>
    series
      .map((point) => `${x(point.month)},${y(point.cash)}`)
      .join(" ");

  const ticks = [maximum, (maximum + minimum) / 2, minimum];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={
        alternative
          ? "Current and scenario cash projections"
          : "Current cash projection"
      }
      style={{ width: "100%", height: "auto" }}
    >
      {ticks.map((value, index) => (
        <g key={index}>
          <line
            x1={left}
            x2={width - right}
            y1={y(value)}
            y2={y(value)}
            stroke="#d5d9ce"
            strokeDasharray="5 5"
          />

          <text
            x={left - 10}
            y={y(value) + 4}
            textAnchor="end"
            fontSize="10"
            fill="#7a806f"
          >
            {money(value)}
          </text>
        </g>
      ))}

      <line
        x1={left}
        x2={width - right}
        y1={y(0)}
        y2={y(0)}
        stroke="#bd9c83"
        strokeDasharray="6 4"
      />

      <polyline
        points={points(base)}
        fill="none"
        stroke={alternative ? "#9ba391" : "#153cbd"}
        strokeWidth="3"
      />

      {alternative && (
        <polyline
          points={points(changed)}
          fill="none"
          stroke="#153cbd"
          strokeWidth="3"
        />
      )}

      {[0, 3, 6, 9, 12].map((month) => (
        <text
          key={month}
          x={x(month)}
          y={height - 10}
          textAnchor="middle"
          fontSize="11"
          fill="#7a806f"
        >
          {month === 0 ? "Today" : `Month ${month}`}
        </text>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const [inputs, setInputs] = useState({ ...SAMPLE });
  const [scenario, setScenario] = useState({
    ...DEFAULT_SCENARIO,
  });

  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isSample, setIsSample] = useState(true);
  const [history, setHistory] = useState([]);

  const parsed = useMemo(() => {
    try {
      return {
        profile: parseProfile(inputs),
        error: null,
      };
    } catch (error) {
      return {
        profile: null,
        error: error.message,
      };
    }
  }, [inputs]);

  const baseline = useMemo(
    () =>
      parsed.profile
        ? calculateForecast(parsed.profile)
        : null,
    [parsed.profile]
  );

  const alternative = useMemo(
    () =>
      parsed.profile
        ? calculateForecast(parsed.profile, scenario)
        : null,
    [parsed.profile, scenario]
  );

  const stories = useMemo(() => {
    if (!baseline || !parsed.profile) return [];

    const query = search.trim().toLowerCase();

    return matchCases(
      baseline.warnings,
      parsed.profile
    ).filter((item) => {
      const tags = item.matchedTags ?? item.matched ?? [];

      return query
        ? JSON.stringify(item).toLowerCase().includes(query)
        : showAll || tags.length > 0;
    });
  }, [baseline, parsed.profile, search, showAll]);

  function updateInput(key, value) {
    setInputs((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function clearInputs() {
    setInputs({
      name: "",
      industry: "Software / AI",
      ...Object.fromEntries(
        FIELDS.map(([key]) => [key, ""])
      ),
    });

    setIsSample(false);
    setScenario({ ...DEFAULT_SCENARIO });
  }

  function saveSnapshot(kind) {
    if (!parsed.profile || !baseline || !alternative) return;

    setHistory((previous) => [
      {
        id: crypto.randomUUID(),
        kind,
        date: new Date().toISOString(),
        sample: isSample,
        profile: { ...parsed.profile },
        scenario: { ...scenario },
        report: kind === "scenario" ? alternative : baseline,
      },
      ...previous,
    ].slice(0, 30));
  }

  function exportReport() {
    if (!parsed.profile || !baseline) return;

    const report = {
      product: "StartupShield",
      dataKind: isSample
        ? "Fictional or edited sample"
        : "User-entered",
      createdAt: new Date().toISOString(),
      profile: parsed.profile,
      baseline,
      scenario: {
        assumptions: scenario,
        result: alternative,
      },
      history,
      limitations:
        "Simplified cash projection, not a prediction. " +
        "Historical cases do not establish causation.",
    };

    const url = URL.createObjectURL(
      new Blob(
        [JSON.stringify(report, null, 2)],
        { type: "application/json" }
      )
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "startupshield-report.json";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="dashboard">
      <header className="hero">
        <p className="eyebrow">STARTUPSHIELD</p>

        <h1>
          A little foresight.
          <br />
          <em>A longer future.</em>
        </h1>

        <p>
          Understand your cash, explore your options,
          and learn from other companies.
        </p>

        <a className="primary" href="#gemini-market-research">
          Research my market with Gemini ↗
        </a>
      </header>

      <div className="workspace-heading">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h2>Perspective for your next move.</h2>
        </div>

        <button onClick={exportReport} disabled={!baseline}>
          Export report ↗
        </button>
      </div>

      <div className="tabs" aria-label="Dashboard views">
        {[
          ["overview", "Overview"],
          ["scenarios", "Scenario studio"],
          ["stories", "Relevant stories"],
          ["progress", "Progress"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={tab === id ? "active" : ""}
          >
            {label}
          </button>
        ))}
      </div>

      {isSample && (
        <p className="notice">
          Fictional sample or edited sample.
          Choose “Enter my own data” before assessing a real business.
        </p>
      )}

      {tab === "overview" && (
        <div className="overview">
          <aside className="inputs">
            <h2>Your business, in numbers.</h2>
            <p className="eyebrow">USD / MONTH</p>

            <button onClick={clearInputs}>
              Enter my own data
            </button>

            <label>
              Business name
              <input
                value={inputs.name}
                maxLength={80}
                onChange={(event) =>
                  updateInput("name", event.target.value)
                }
              />
            </label>

            <label>
              Business type
              <select
                value={inputs.industry}
                onChange={(event) =>
                  updateInput("industry", event.target.value)
                }
              >
                <option>Software / AI</option>
                <option>Local business</option>
                <option>Services</option>
                <option>Other</option>
              </select>
            </label>

            <div className="fields">
              {FIELDS.map(([key, label]) => (
                <label key={key}>
                  {label}

                  <input
                    type="number"
                    min={key === "growth" ? -50 : 0}
                    max={
                      ["growth", "churn", "concentration"].includes(key)
                        ? 100
                        : 10_000_000_000
                    }
                    step={key === "customers" ? 1 : "any"}
                    value={inputs[key]}
                    placeholder="Enter a value"
                    onChange={(event) =>
                      updateInput(key, event.target.value)
                    }
                  />
                </label>
              ))}
            </div>

            <p className="fine">
              Results update as you type. Monthly growth is net
              revenue growth. Churn is assessed separately and
              is not subtracted a second time.
            </p>
          </aside>

          <div className="analysis">
            {parsed.error ? (
              <p className="notice">{parsed.error}</p>
            ) : (
              <>
                <p className="eyebrow">THE OUTLOOK</p>

                <div className="metrics">
                  <div>
                    <span>Projected cash runway</span>
                    <strong>{runwayLabel(baseline)}</strong>
                    <small>months · entered assumptions</small>
                  </div>

                  <div>
                    <span>Monthly net burn</span>
                    <strong>{money(baseline.burn)}</strong>
                    <small>first-month cash shortfall</small>
                  </div>

                  <div>
                    <span>Cash on hand</span>
                    <strong>{money(parsed.profile.cash)}</strong>
                    <small>starting cash balance</small>
                  </div>
                </div>

                <article className="chart">
                  <h3>A little perspective on your cash.</h3>
                  <p className="fine">
                    Projected cash balance · next 12 months
                  </p>

                  <Chart baseline={baseline} />

                  <p className="fine">
                    A projection, not a prediction. “24+” means
                    no zero crossing within the modeled 24 months.
                  </p>
                </article>

                <h3>Worth a closer look</h3>

                {baseline.warnings.length ? (
                  baseline.warnings.map((warning) => (
                    <article className="warning" key={warning.id}>
                      <h4>{warning.title}</h4>
                      <p>{warning.detail}</p>
                    </article>
                  ))
                ) : (
                  <p className="notice">
                    No heuristic alerts from these inputs.
                    This does not establish overall business health.
                  </p>
                )}

                <article className="brief">
                  <p className="eyebrow">YOUR FINANCIAL BRIEF</p>

                  <p>
                    {baseline.net < 0
                      ? `First-month expenses exceed revenue by ${money(
                          -baseline.net
                        )}.`
                      : `First-month revenue exceeds expenses by ${money(
                          baseline.net
                        )}.`}{" "}
                    {baseline.runway === null
                      ? "Cash remains above zero within the 24-month model."
                      : `The modeled cash balance reaches zero after approximately ${baseline.runway.toFixed(
                          1
                        )} months.`}
                  </p>

                  <a href="#gemini-market-research">
                    Add live market research with Gemini ↗
                  </a>
                </article>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "scenarios" && (
        <section>
          <h2>What if you changed the plan?</h2>

          <div className="scenario-controls">
            {SCENARIO_FIELDS.map(([key, label, minimum, maximum]) => (
              <label key={key}>
                {label}: {scenario[key]}%

                <input
                  type="range"
                  min={minimum}
                  max={maximum}
                  step="1"
                  value={scenario[key]}
                  onChange={(event) =>
                    setScenario((previous) => ({
                      ...previous,
                      [key]: Number(event.target.value),
                    }))
                  }
                />
              </label>
            ))}
          </div>

          <button
            onClick={() =>
              setScenario({ ...DEFAULT_SCENARIO })
            }
          >
            Reset assumptions
          </button>

          {baseline && alternative ? (
            <>
              <div className="metrics">
                <div>
                  <span>Current first-month cash flow</span>
                  <strong>{money(baseline.net)}</strong>
                </div>

                <div>
                  <span>Scenario first-month cash flow</span>
                  <strong>{money(alternative.net)}</strong>
                </div>

                <div>
                  <span>Scenario modeled runway</span>
                  <strong>{runwayLabel(alternative)}</strong>
                </div>
              </div>

              <article className="chart">
                <p className="fine">
                  Gray: current assumptions · Blue: scenario
                </p>

                <Chart
                  baseline={baseline}
                  alternative={alternative}
                />
              </article>

              <button
                className="primary"
                onClick={() => saveSnapshot("scenario")}
              >
                Save scenario as a projection
              </button>
            </>
          ) : (
            <p className="notice">
              Complete the financial inputs in Overview first.
            </p>
          )}

          <p className="fine">
            Price changes apply immediately to retained revenue.
            Customer loss reduces revenue; AI costs have their own
            reduction control. General reductions apply to payroll,
            operations, and marketing. Implementation costs,
            seasonality, taxes, and new financing are not modeled.
          </p>
        </section>
      )}

      {tab === "stories" && (
        <section>
          <p className="eyebrow">CONTEXT, NOT A CRYSTAL BALL</p>

          <h2>
            Other chapters.
            <br />
            <em>Useful perspective.</em>
          </h2>

          <label>
            Search the historical library
            <input
              type="search"
              value={search}
              placeholder="Try Monite, Buffer, pricing, or retention"
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </label>

          <button onClick={() => setShowAll(!showAll)}>
            {showAll
              ? "Show risk-related cases"
              : `Browse all ${companyCases.length} cases`}
          </button>

          <p className="fine">
            {stories.length} cases match this view.
            Showing up to {showAll || search ? 100 : 6}.
          </p>

          <div className="story-grid">
            {stories
              .slice(0, showAll || search ? 100 : 6)
              .map((item) => {
                const tags =
                  item.matchedTags ?? item.matched ?? [];

                return (
                  <article className="story" key={item.id}>
                    <p className="eyebrow">
                      {tags.length
                        ? `Shared risk tags: ${tags.join(", ")}`
                        : "General historical context"}
                    </p>

                    <h3>{item.company}</h3>

                    <dl>
                      <dt>DOCUMENTED SITUATION</dt>
                      <dd>{item.problem}</dd>

                      <dt>REPORTED ACTION</dt>
                      <dd>{item.response}</dd>

                      <dt>REPORTED OUTCOME</dt>
                      <dd>{item.outcome}</dd>
                    </dl>

                    <p className="fine">
                      {item.limitation}
                    </p>

                    <a
                      href={item.sourceUrl || item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read original source ↗
                    </a>
                  </article>
                );
              })}
          </div>

          {!stories.length && (
            <p className="notice">
              No related case is selected for these warnings.
              Search a company or choose “Browse all” to explore
              the library. Missing context is not proof that a
              risk is absent.
            </p>
          )}

          <p className="fine">
            Matches use shared topics and available sector context,
            not exact financial similarity. Historical actions may
            have failed. Reported improvements do not establish
            causation.
          </p>
        </section>
      )}

      {tab === "progress" && (
        <section>
          <h2>A record of your next moves.</h2>

          <button
            className="primary"
            disabled={!baseline}
            onClick={() => saveSnapshot("actuals")}
          >
            Save current input snapshot
          </button>

          <p className="fine">
            Snapshots remain in this browser session.
            Export the report to keep a copy.
            A scenario records a projection, not an implemented change.
          </p>

          {history.map((item) => (
            <article className="story" key={item.id}>
              <p className="eyebrow">
                {item.kind === "scenario"
                  ? "SAVED PROJECTION"
                  : "INPUT SNAPSHOT"}{" "}
                · {item.sample ? "FICTIONAL / EDITED SAMPLE" : "USER-ENTERED"}
              </p>

              <h3>{item.profile.name}</h3>

              <p className="fine">
                {new Date(item.date).toLocaleString()}
              </p>

              <p>
                Starting cash: {money(item.profile.cash)}
                <br />
                First-month cash flow: {money(item.report.net)}
                <br />
                Modeled runway: {runwayLabel(item.report)} months
              </p>

              <button
                onClick={() =>
                  setHistory((previous) =>
                    previous.filter((entry) => entry.id !== item.id)
                  )
                }
              >
                Remove
              </button>
            </article>
          ))}

          {!history.length && (
            <p className="notice">
              No snapshots saved yet.
            </p>
          )}
        </section>
      )}

      <details className="method">
        <summary>How the calculations work</summary>

        <p>
          First-month cash flow equals revenue minus payroll,
          operations, marketing, and AI costs. Revenue compounds
          at the entered net monthly growth rate. AI costs grow
          at the same rate; other expenses remain fixed unless
          changed in a scenario.
        </p>

        <p>
          The model runs for 24 months. Runway is the first zero
          crossing, interpolated within that month. It does not
          include taxes, debt payments, or other obligations
          unless already included in the entered expenses.
        </p>

        <p>
          Alerts use illustrative thresholds: runway below six
          months, churn above 5%, AI costs above 15% of revenue,
          and customer concentration above 30%. They are prompts
          for investigation—not validated industry benchmarks,
          credit scores, or failure probabilities.
        </p>
      </details>

      <style jsx>{`
        .dashboard {
          padding: 35px clamp(18px, 4vw, 70px) 65px;
          background: #f8f7f3;
          color: #34372f;
          font: 15px/1.65 Arial, sans-serif;
        }

        .dashboard * {
          box-sizing: border-box;
        }

        .hero {
          text-align: center;
          padding: 45px 0 70px;
        }

        .hero h1 {
          margin: 20px 0;
          font: normal clamp(45px, 6vw, 80px)/1.08 Georgia, serif;
          letter-spacing: -2px;
        }

        .hero > p:not(.eyebrow) {
          color: #74796c;
          margin-bottom: 30px;
        }

        .eyebrow {
          color: #173fb8;
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        h2 {
          font: normal 34px/1.2 Georgia, serif;
          margin: 12px 0 22px;
        }

        h3 {
          font: normal 27px/1.2 Georgia, serif;
          margin: 12px 0;
        }

        h4 {
          margin: 0 0 7px;
          font-size: 14px;
        }

        a {
          color: #173fb8;
        }

        button,
        .primary {
          display: inline-block;
          padding: 11px 18px;
          border: 1px solid #d4d8ca;
          border-radius: 30px;
          color: #34372f;
          background: transparent;
          font: inherit;
          font-size: 13px;
          text-decoration: none;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .primary {
          color: white;
          background: #153cbd;
          border-color: #153cbd;
        }

        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        select:focus-visible,
        summary:focus-visible {
          outline: 3px solid #738bdd;
          outline-offset: 3px;
        }

        .workspace-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 18px 0;
          border-bottom: 1px solid #dcdfd3;
        }

        .tabs .active {
          color: white;
          background: #153cbd;
          border-color: #153cbd;
        }

        .notice {
          padding: 15px 19px;
          border-radius: 9px;
          background: #edf0fa;
          border: 1px solid #dce2f3;
          color: #5e6987;
          font-size: 12px;
        }

        .overview {
          display: grid;
          grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
          gap: 40px;
          padding-top: 25px;
        }

        .inputs {
          padding-right: 25px;
          border-right: 1px solid #dcdfd3;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin: 17px 0;
          color: #72796a;
          font-size: 12px;
        }

        input,
        select {
          width: 100%;
          min-width: 0;
          padding: 12px;
          border: 1px solid #d5d9cc;
          border-radius: 8px;
          background: #fffefa;
          color: #34372f;
          font: inherit;
        }

        .fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 14px;
        }

        .analysis {
          min-width: 0;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          padding: 20px 0 30px;
        }

        .metrics span,
        .metrics small {
          display: block;
          color: #7a806f;
          font-size: 11px;
        }

        .metrics strong {
          display: block;
          margin: 12px 0;
          font: normal clamp(27px, 3vw, 46px)/1.1 Georgia, serif;
          overflow-wrap: anywhere;
        }

        .chart {
          padding: 23px;
          margin-bottom: 27px;
          border-radius: 12px;
          background: #f0f1ea;
        }

        .warning {
          padding: 17px 20px;
          margin: 12px 0;
          border: 1px solid #e1d4bb;
          border-radius: 9px;
          background: #fbf6ed;
        }

        .warning p {
          margin: 0;
          color: #78735f;
          font-size: 12px;
        }

        .brief {
          margin: 25px 0;
          padding: 23px;
          border: 1px solid #dce2f3;
          border-radius: 11px;
          background: #edf0fa;
        }

        .brief a {
          font-size: 13px;
        }

        .fine {
          color: #7a806f;
          font-size: 12px;
        }

        .scenario-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 25px;
        }

        .story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 25px;
        }

        .story {
          padding: 25px;
          margin: 15px 0;
          border: 1px solid #dce0d3;
          border-radius: 12px;
          background: #fffefa;
        }

        dt {
          margin-top: 18px;
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 1px;
        }

        dd {
          margin: 5px 0;
          color: #737c67;
          font-size: 13px;
        }

        .method {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dcdfd3;
          color: #72796a;
          font-size: 12px;
        }

        summary {
          cursor: pointer;
        }

        @media (max-width: 950px) {
          .overview {
            grid-template-columns: 1fr;
          }

          .inputs {
            padding-right: 0;
            border-right: 0;
          }
        }

        @media (max-width: 600px) {
          .metrics,
          .story-grid,
          .scenario-controls {
            grid-template-columns: 1fr;
          }

          .workspace-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .hero {
            padding-top: 20px;
          }

          .hero h1 {
            letter-spacing: -1px;
          }

          .chart {
            padding: 12px;
          }
        }
      `}</style>
    </section>
  );
}
