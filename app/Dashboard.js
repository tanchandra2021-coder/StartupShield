"use client";

import { useState } from "react";
import { companyCases } from "../lib/cases";

const EMPTY = {
  name: "",
  cash: "",
  revenue: "",
  fixed: "",
  variable: "",
  growth: "0",
};

const DEMOS = {
  pressure: {
    name: "Sunday Studio — fictional demo",
    cash: "24000",
    revenue: "12000",
    fixed: "15000",
    variable: "6000",
    growth: "0",
  },
  stronger: {
    name: "Sunday Studio — stronger fictional example",
    cash: "75000",
    revenue: "30000",
    fixed: "15000",
    variable: "6000",
    growth: "0",
  },
};

const ZERO_SCENARIO = {
  price: "0",
  loss: "0",
  fixedCut: "0",
};

const FIELDS = [
  ["cash", "Cash on hand ($)"],
  ["revenue", "Monthly revenue ($)"],
  ["fixed", "Monthly fixed cash costs ($)"],
  ["variable", "Monthly variable cash costs ($)"],
  ["growth", "Assumed monthly sales growth (%)"],
];

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function readProfile(form) {
  const result = { name: form.name.trim() || "Your business" };

  for (const [key, label] of FIELDS) {
    if (String(form[key]).trim() === "") {
      throw new Error(`Enter ${label.toLowerCase()}.`);
    }

    const value = Number(form[key]);

    if (
      !Number.isFinite(value) ||
      value > 1e10 ||
      (key === "growth"
        ? value < -50 || value > 100
        : value < 0)
    ) {
      throw new Error(`Check ${label.toLowerCase()}.`);
    }

    result[key] = value;
  }

  return result;
}

function readScenario(form) {
  const ranges = {
    price: [-20, 50],
    loss: [0, 50],
    fixedCut: [0, 50],
  };

  const result = {};

  for (const [key, [minimum, maximum]] of Object.entries(ranges)) {
    const value = Number(form[key]);

    if (
      String(form[key]).trim() === "" ||
      !Number.isFinite(value) ||
      value < minimum ||
      value > maximum
    ) {
      throw new Error(
        `Scenario ${key} must be between ${minimum}% and ${maximum}%.`
      );
    }

    result[key] = value;
  }

  return result;
}

function project(profile, scenario = { price: 0, loss: 0, fixedCut: 0 }) {
  const points = [profile.cash];
  let cash = profile.cash;
  let runway = profile.cash === 0 ? 0 : null;
  let firstMonth = null;

  for (let month = 1; month <= 24; month++) {
    const salesFactor =
      Math.pow(1 + profile.growth / 100, month - 1) *
      (1 - scenario.loss / 100);

    const revenue =
      profile.revenue *
      salesFactor *
      (1 + scenario.price / 100);

    const variable = profile.variable * salesFactor;
    const fixed = profile.fixed * (1 - scenario.fixedCut / 100);
    const net = revenue - fixed - variable;
    const previousCash = cash;

    cash += net;
    points.push(cash);

    if (month === 1) {
      firstMonth = { revenue, expenses: fixed + variable, net };
    }

    if (runway === null && cash <= 0) {
      runway =
        month - 1 +
        (previousCash > 0 && net < 0 ? previousCash / -net : 0);
    }
  }

  return { points, runway, firstMonth };
}

function historicalMatches(tags) {
  return companyCases
    .filter(item => !item.analogOnly && !item.identityNeedsReview)
    .map(item => ({
      ...item,
      matches: (Array.isArray(item.tags) ? item.tags : [])
        .filter(tag => tags.includes(tag)),
    }))
    .filter(item => item.matches.length > 0)
    .sort((a, b) => b.matches.length - a.matches.length)
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

function Chart({ baseline, scenario }) {
  const current = baseline.slice(0, 13);
  const alternative = scenario.slice(0, 13);
  const values = [...current, ...alternative, 0];

  const low = Math.min(...values);
  const high = Math.max(...values);
  const padding = Math.max((high - low) * 0.12, 1000);
  const minimum = low - padding;
  const maximum = high + padding;

  const x = index => 85 + (index / 12) * 720;
  const y = value => 255 - ((value - minimum) / (maximum - minimum)) * 220;

  const path = points =>
    points
      .map((value, index) =>
        `${index === 0 ? "M" : "L"} ${x(index)} ${y(value)}`
      )
      .join(" ");

  return (
    <svg
      viewBox="0 0 840 305"
      role="img"
      aria-label="Twelve-month cash projection comparing the current path with a hypothetical scenario"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      {[minimum, (minimum + maximum) / 2, maximum].map((value, index) => (
        <g key={index}>
          <line
            x1="85"
            x2="805"
            y1={y(value)}
            y2={y(value)}
            stroke="#d9dccf"
            strokeDasharray="5 6"
          />
          <text
            x="74"
            y={y(value) + 4}
            textAnchor="end"
            fill="#737868"
            fontSize="12"
          >
            {money(value)}
          </text>
        </g>
      ))}

      <line
        x1="85"
        x2="805"
        y1={y(0)}
        y2={y(0)}
        stroke="#bd816d"
        strokeDasharray="6 4"
      />

      <path
        d={path(current)}
        fill="none"
        stroke="#193ec2"
        strokeWidth="3"
      />

      <path
        d={path(alternative)}
        fill="none"
        stroke="#65815d"
        strokeWidth="3"
        strokeDasharray="7 5"
      />

      {[0, 3, 6, 9, 12].map(month => (
        <text
          key={month}
          x={x(month)}
          y="288"
          textAnchor="middle"
          fill="#737868"
          fontSize="12"
        >
          {month === 0 ? "Today" : `Month ${month}`}
        </text>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const [form, setForm] = useState({ ...EMPTY });
  const [profile, setProfile] = useState(null);
  const [scenario, setScenario] = useState({ ...ZERO_SCENARIO });
  const [fictional, setFictional] = useState(false);
  const [error, setError] = useState("");

  function loadDemo(type) {
    const demo = { ...DEMOS[type] };

    setForm(demo);
    setProfile(readProfile(demo));
    setScenario({ ...ZERO_SCENARIO });
    setFictional(true);
    setError("");
  }

  function update(key, value) {
    setForm(previous => ({ ...previous, [key]: value }));
    setProfile(null);
    setError("");
  }

  function submit(event) {
    event.preventDefault();

    try {
      setProfile(readProfile(form));
      setScenario({ ...ZERO_SCENARIO });
      setError("");
    } catch (err) {
      setProfile(null);
      setError(err.message);
    }
  }

  let baseline = null;
  let alternative = null;
  let scenarioError = "";

  if (profile) {
    baseline = project(profile);

    try {
      alternative = project(profile, readScenario(scenario));
    } catch (err) {
      scenarioError = err.message;
    }
  }

  const riskTags = [];

  if (baseline) {
    if (baseline.firstMonth.net < 0) riskTags.push("burn");
    if (baseline.runway !== null && baseline.runway < 6) {
      riskTags.push("cash");
    }

    if (
      profile.revenue > 0 &&
      profile.variable >= profile.revenue
    ) {
      riskTags.push("pricing", "margin", "unit_economics");
    }
  }

  const stories = historicalMatches(riskTags);

  function runwayText(value) {
    return value === null ? "24+" : value.toFixed(1);
  }

  return (
    <div className="dashboard">
      <header>
        <p className="eyebrow">STARTUPSHIELD / FINANCIAL OUTLOOK</p>

        <h1>
          Your business,
          <br />
          <em>with a little perspective.</em>
        </h1>

        <p className="intro">
          Understand your cash, compare a possible change, and
          explore related company experiences.
        </p>
      </header>

      <section className="demo">
        <div>
          <strong>Presenting the project?</strong>
          <p>Load a complete fictional example. No typing required.</p>
        </div>

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
              setForm({ ...EMPTY });
              setProfile(null);
              setScenario({ ...ZERO_SCENARIO });
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
          DEMO MODE — fictional figures. The two examples are separate
          scenarios, not evidence of an actual business recovery.
        </p>
      )}

      <div className="layout">
        <form className="panel" onSubmit={submit}>
          <h2>Your business, in numbers.</h2>

          <label>
            Business name
            <input
              value={form.name}
              onChange={event => update("name", event.target.value)}
              maxLength={120}
              placeholder="Your business"
            />
          </label>

          {FIELDS.map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type="number"
                step="any"
                min={key === "growth" ? "-50" : "0"}
                max={key === "growth" ? "100" : undefined}
                value={form[key]}
                onChange={event => update(key, event.target.value)}
                placeholder="Enter amount"
              />
            </label>
          ))}

          <p className="small">
            Enter each expense once. Fixed costs stay broadly constant;
            variable costs rise with sales. Revenue is assumed collected
            in the same month.
          </p>

          {error && <p role="alert" className="error">{error}</p>}

          <button className="primary" type="submit">
            Update my outlook ↗
          </button>
        </form>

        <section>
          {!baseline ? (
            <div className="panel empty">
              <h2>A clearer outlook starts here.</h2>
              <p>
                Choose either demo above or enter your own figures
                and click Update my outlook.
              </p>
            </div>
          ) : (
            <>
              <div className="metrics">
                <div>
                  <span>Projected cash runway</span>
                  <strong>{runwayText(baseline.runway)}</strong>
                  <small>months within the 24-month model</small>
                </div>

                <div>
                  <span>First-month net cash flow</span>
                  <strong>{money(baseline.firstMonth.net)}</strong>
                  <small>revenue minus entered cash costs</small>
                </div>

                <div>
                  <span>Starting cash</span>
                  <strong>{money(profile.cash)}</strong>
                  <small>available cash balance</small>
                </div>
              </div>

              <div className="panel">
                <h2>A little perspective on your cash.</h2>

                <p className="small">
                  Blue: current path. Dashed green: hypothetical scenario.
                  Negative balances show an unfunded cash shortfall.
                </p>

                <Chart
                  baseline={baseline.points}
                  scenario={(alternative || baseline).points}
                />

                <p className="small">
                  Projection, not prediction. Costs and sales follow
                  the entered assumptions. Taxes, debt payments, and
                  collection delays are not modeled separately.
                </p>
              </div>

              <div className="panel">
                <p className="eyebrow">SCENARIO STUDIO</p>
                <h2>What if you changed the plan?</h2>

                <button
                  type="button"
                  onClick={() =>
                    setScenario({
                      price: "20",
                      loss: "5",
                      fixedCut: "25",
                    })
                  }
                >
                  Demo: test a possible fix
                </button>

                <p className="small">
                  This loads a 20% price increase, 5% fewer sales,
                  and 25% lower fixed costs. These changes are
                  hypothetical and may be impractical for a real business.
                </p>

                <div className="scenarioFields">
                  {[
                    ["price", "Price change (%)", -20, 50],
                    ["loss", "Sales volume lost (%)", 0, 50],
                    ["fixedCut", "Fixed cost reduction (%)", 0, 50],
                  ].map(([key, label, min, max]) => (
                    <label key={key}>
                      {label}
                      <input
                        type="number"
                        step="any"
                        min={min}
                        max={max}
                        value={scenario[key]}
                        onChange={event =>
                          setScenario(previous => ({
                            ...previous,
                            [key]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  ))}
                </div>

                {scenarioError && (
                  <p role="alert" className="error">{scenarioError}</p>
                )}

                {alternative && (
                  <div className="brief">
                    <strong>Scenario result</strong>
                    <p>
                      First-month net cash flow changes from{" "}
                      {money(baseline.firstMonth.net)} to{" "}
                      {money(alternative.firstMonth.net)}.
                      {" "}Projected runway changes from{" "}
                      {runwayText(baseline.runway)} to{" "}
                      {runwayText(alternative.runway)} months.
                    </p>

                    <p className="small">
                      Variable costs follow sales volume, not the
                      selling price. Savings are assumed immediate;
                      implementation costs are excluded.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setScenario({ ...ZERO_SCENARIO })}
                >
                  Reset scenario
                </button>
              </div>

              <div className="panel">
                <h2>Your financial brief.</h2>

                <p>
                  {baseline.firstMonth.net < 0
                    ? `At these monthly levels, spending exceeds revenue by ${money(
                        -baseline.firstMonth.net
                      )}.`
                    : `At these monthly levels, revenue covers entered spending with ${money(
                        baseline.firstMonth.net
                      )} remaining.`}
                  {" "}
                  {baseline.runway === null
                    ? "Cash stays above zero throughout the 24-month model."
                    : baseline.runway === 0
                      ? "There is no starting cash cushion."
                      : `Cash reaches zero after approximately ${baseline.runway.toFixed(
                          1
                        )} months.`}
                </p>

                <p>
                  Investigate payment timing, upcoming obligations,
                  and the largest spending categories before acting.
                </p>
              </div>

              <div className="panel">
                <h2>Related historical experiences.</h2>

                {stories.length === 0 && (
                  <p>
                    No eligible risk-tag match was selected for these
                    inputs. This does not establish overall business health.
                  </p>
                )}

                {stories.map(item => {
                  const url = safeUrl(item.sourceUrl || item.url);

                  return (
                    <article className="story" key={item.id}>
                      <h3>{item.company}</h3>
                      <p className="small">
                        Shared tags: {item.matches.join(", ")}
                      </p>

                      <p><strong>Challenge: </strong>{item.problem}</p>
                      <p><strong>Reported response: </strong>{item.response}</p>
                      <p>
                        <strong>Reported outcome: </strong>
                        {item.outcome || item.result || "Not documented."}
                      </p>

                      <p className="small">
                        {item.limitation ||
                          "Different markets, scale, and time periods limit this comparison."}
                      </p>

                      {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          Read the source ↗
                        </a>
                      )}
                    </article>
                  );
                })}

                <p className="small">
                  Cases match shared risk tags, not statistical similarity.
                  Historical outcomes do not establish causation.
                </p>
              </div>
            </>
          )}

          <a className="marketLink" href="/diagnostics">
            Research my market — open the five-risk checkup ↗
          </a>
        </section>
      </div>

      <style jsx>{`
        .dashboard {
          background: #f8f7f3;
          color: #34372f;
          padding: 45px clamp(18px, 4vw, 65px) 60px;
          font-family: Arial, sans-serif;
          line-height: 1.6;
        }
        h1, h2, h3 {
          font-family: Georgia, serif;
          font-weight: 400;
          line-height: 1.15;
        }
        h1 {
          font-size: clamp(44px, 6vw, 76px);
          margin: 15px 0;
          letter-spacing: -2px;
        }
        h2 { font-size: 29px; margin: 0 0 20px; }
        h3 { font-size: 26px; margin: 0 0 12px; }
        .eyebrow {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .intro { max-width: 620px; color: #707568; }
        .demo, .panel {
          border: 1px solid #deded5;
          border-radius: 17px;
          padding: 25px;
          margin-bottom: 22px;
        }
        .demo { background: #edf0f9; margin-top: 30px; }
        .demo p { margin: 5px 0 15px; }
        .buttons { display: flex; gap: 10px; flex-wrap: wrap; }
        button {
          padding: 12px 18px;
          border: 1px solid #cdd0c3;
          border-radius: 28px;
          background: #fffefa;
          color: #34372f;
          font: inherit;
          cursor: pointer;
        }
        .layout {
          display: grid;
          grid-template-columns: minmax(240px, 330px) minmax(0, 1fr);
          gap: 28px;
          align-items: start;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #686e60;
        }
        input {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          border: 1px solid #d5d8cc;
          border-radius: 11px;
          padding: 13px;
          background: #fffefa;
          color: #34372f;
          font: inherit;
          font-size: 16px;
        }
        input:focus { outline: 2px solid #193ec2; }
        .primary, .marketLink {
          background: #193ec2;
          color: white;
          border: 0;
        }
        .primary { width: 100%; }
        .marketLink {
          display: block;
          text-align: center;
          text-decoration: none;
          border-radius: 30px;
          padding: 17px;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        .metrics div { padding: 12px; border-left: 1px solid #deded5; }
        .metrics span, .metrics small { display: block; color: #737868; }
        .metrics span { font-size: 13px; }
        .metrics strong {
          display: block;
          font-family: Georgia, serif;
          font-weight: 400;
          font-size: clamp(25px, 3vw, 42px);
          margin: 9px 0;
          overflow-wrap: anywhere;
        }
        .metrics small, .small { font-size: 12px; color: #737868; }
        .scenarioFields {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .brief, .story {
          background: #eeeee7;
          padding: 20px;
          border-radius: 12px;
          margin: 18px 0;
        }
        .notice, .error { padding: 15px; border-radius: 12px; }
        .notice { background: #f4eadb; color: #775521; }
        .error { background: #f9e8e8; color: #912e2e; }
        a { color: #193ec2; }
        .empty { min-height: 180px; }
        @media (max-width: 900px) {
          .layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 550px) {
          .metrics, .scenarioFields { grid-template-columns: 1fr; }
          .panel, .demo { padding: 20px; }
        }
      `}</style>
    </div>
  );
}
