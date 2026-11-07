"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  samples,
  validateProfile,
  forecast,
  money,
  runwayLabel,
  explain,
  parseFinancialCSV,
  zeroScenario,
} from "../lib/finance";

import {
  companyCases,
  matchCases,
} from "../lib/cases";

const STORAGE_KEY = "startupshield-react-v1";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "scenarios", label: "Scenario studio" },
  { id: "cases", label: "Relevant stories" },
  { id: "progress", label: "Progress" },
];

const sliderDefinitions = [
  {
    key: "price",
    label: "Price change",
    min: -20,
    max: 50,
  },
  {
    key: "cost",
    label: "General expense reduction",
    min: 0,
    max: 50,
  },
  {
    key: "ai",
    label: "AI / API cost reduction",
    min: 0,
    max: 80,
  },
  {
    key: "loss",
    label: "Customer revenue loss",
    min: 0,
    max: 50,
  },
];

function Metric({ label, value, note }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function NumberField({
  name,
  label,
  value,
  onChange,
  min = 0,
  max = 10_000_000_000,
}) {
  return (
    <label>
      {label}

      <input
        name={name}
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step="any"
        required
      />
    </label>
  );
}

function CashChart({ baseline, scenario, id }) {
  const basePoints = baseline.series.slice(0, 13);
  const scenarioPoints =
    scenario?.series.slice(0, 13);

  const allPoints = [
    ...basePoints,
    ...(scenarioPoints || []),
  ];

  const maximum =
    Math.max(1000, ...allPoints.map((point) => point.cash)) *
    1.08;

  const minimum =
    Math.min(0, ...allPoints.map((point) => point.cash)) *
    1.08;

  const width = 640;
  const height = 230;

  const left = 58;
  const right = 15;
  const top = 12;
  const bottom = 28;

  const x = (month) =>
    left + (month / 12) * (width - left - right);

  const y = (value) =>
    top +
    ((maximum - value) / (maximum - minimum)) *
      (height - top - bottom);

  const linePath = (points) =>
    points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${x(
            index
          ).toFixed(2)} ${y(point.cash).toFixed(2)}`
      )
      .join(" ");

  const basePath = linePath(basePoints);

  const areaPath = `
    ${basePath}
    L ${x(12)} ${height - bottom}
    L ${x(0)} ${height - bottom}
    Z
  `;

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={
          scenario
            ? "Baseline and scenario cash projections over twelve months"
            : "Cash projection over twelve months"
        }
      >
        <defs>
          <linearGradient
            id={`${id}-gradient`}
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#123db6"
              stopOpacity="0.14"
            />

            <stop
              offset="100%"
              stopColor="#123db6"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((index) => {
          const value =
            minimum + ((maximum - minimum) * index) / 3;

          return (
            <g key={index}>
              <line
                x1={left}
                y1={y(value)}
                x2={width - right}
                y2={y(value)}
                stroke="#dcded5"
                strokeDasharray="3 5"
              />

              <text
                x={left - 10}
                y={y(value) + 3}
                textAnchor="end"
                fill="#85897d"
                fontSize="9"
                fontFamily="Arial"
              >
                {Math.abs(value) >= 1000
                  ? `$${(value / 1000).toFixed(0)}k`
                  : money(value)}
              </text>
            </g>
          );
        })}

        {minimum < 0 && (
          <line
            x1={left}
            y1={y(0)}
            x2={width - right}
            y2={y(0)}
            stroke="#bc917f"
            strokeDasharray="4 3"
          />
        )}

        {!scenario && (
          <path
            d={areaPath}
            fill={`url(#${id}-gradient)`}
          />
        )}

        <path
          d={basePath}
          fill="none"
          stroke={scenario ? "#a1a69a" : "#123db6"}
          strokeWidth="2.5"
          strokeDasharray={scenario ? "5 4" : undefined}
        />

        {scenarioPoints && (
          <path
            d={linePath(scenarioPoints)}
            fill="none"
            stroke="#123db6"
            strokeWidth="2.5"
          />
        )}

        {[0, 3, 6, 9, 12].map((month) => (
          <text
            key={month}
            x={x(month)}
            y={height - 6}
            textAnchor="middle"
            fill="#85897d"
            fontSize="9"
            fontFamily="Arial"
          >
            {month === 0 ? "Today" : `Month ${month}`}
          </text>
        ))}
      </svg>

      <details className="chart-data">
        <summary>View chart data</summary>

        <table>
          <caption>
            Projected cash balance in USD
          </caption>

          <thead>
            <tr>
              <th>Month</th>
              <th>Baseline</th>
              {scenario && <th>Scenario</th>}
            </tr>
          </thead>

          <tbody>
            {basePoints.map((point, index) => (
              <tr key={point.month}>
                <td>{point.month}</td>
                <td>{money(point.cash)}</td>

                {scenarioPoints && (
                  <td>
                    {money(scenarioPoints[index].cash)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function CaseCard({ companyCase }) {
  return (
    <article
      className="case-card"
      id={`case-${companyCase.id}`}
    >
      <div
        className={`case-cover ${companyCase.color}`}
      >
        <span className="case-company">
          {companyCase.company}
        </span>

        <span>
          {companyCase.year} / {companyCase.category}
        </span>
      </div>

      <div className="case-body">
        <p className="match-label">
          {companyCase.matchedTags?.length
            ? `Relevant risk tags: ${companyCase.matchedTags.join(
                ", "
              )}`
            : "General context · no matching risk tags"}
        </p>

        <h4>{companyCase.title}</h4>

        <dl>
          <dt>DOCUMENTED CHALLENGE</dt>
          <dd>{companyCase.problem}</dd>

          <dt>REPORTED RESPONSE</dt>
          <dd>{companyCase.response}</dd>

          <dt>REPORTED OUTCOME</dt>
          <dd>{companyCase.outcome}</dd>
        </dl>

        <div className="case-limitation">
          <strong>
            Where the comparison falls short
          </strong>

          <p>{companyCase.limitation}</p>
        </div>

        <div className="source-links">
          <a
            href={companyCase.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {companyCase.sourceLabel} ↗
          </a>

          {companyCase.followupUrl && (
            <a
              href={companyCase.followupUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow-up report ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function StartupShield() {
  const [profile, setProfile] = useState({
    ...samples.studio,
  });

  const [draft, setDraft] = useState({
    ...samples.studio,
  });

  const [scenario, setScenario] = useState(
    zeroScenario
  );

  const [activeTab, setActiveTab] =
    useState("overview");

  const [history, setHistory] = useState([]);
  const [isSample, setIsSample] = useState(true);
  const [selectedSample, setSelectedSample] =
    useState("studio");

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [toast, setToast] = useState("");

  const [loaded, setLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] =
    useState(true);

  const [accessToken, setAccessToken] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fileInput = useRef(null);
  const tabRefs = useRef([]);

  const baseline = useMemo(
    () => forecast(profile),
    [profile]
  );

  const scenarioResult = useMemo(
    () => forecast(profile, scenario),
    [profile, scenario]
  );

  const matchedCases = useMemo(
    () => matchCases(baseline.warnings),
    [baseline]
  );

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return matchedCases;
    }

    return matchedCases.filter((companyCase) =>
      JSON.stringify(companyCase)
        .toLowerCase()
        .includes(query)
    );
  }, [matchedCases, search]);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "null"
      );

      if (stored) {
        const restoredProfile = validateProfile(
          stored.profile
        );

        setProfile(restoredProfile);
        setDraft(restoredProfile);
        setIsSample(Boolean(stored.isSample));

        const restoredHistory = Array.isArray(
          stored.history
        )
          ? stored.history
              .filter((entry) => {
                try {
                  validateProfile(entry.profile);

                  forecast(
                    entry.profile,
                    entry.scenario || zeroScenario()
                  );

                  return (
                    typeof entry.id === "string" &&
                    ["scenario", "actuals"].includes(
                      entry.kind
                    ) &&
                    Number.isFinite(
                      Date.parse(entry.date)
                    )
                  );
                } catch {
                  return false;
                }
              })
              .slice(0, 40)
          : [];

        setHistory(restoredHistory);
      }
    } catch {
      setStorageAvailable(false);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          profile,
          history,
          isSample,
        })
      );

      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [loaded, profile, history, isSample]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(
      () => setToast(""),
      4500
    );

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    setAiText("");
  }, [profile]);

  function changeDraft(event) {
    const { name, value } = event.target;

    setDraft((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function updateProfile(event) {
    event.preventDefault();

    try {
      const validProfile = validateProfile(draft);

      setProfile(validProfile);
      setDraft(validProfile);
      setIsSample(false);
      setScenario(zeroScenario());
      setNotice("");
      setToast("Your outlook is updated.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  function loadSample(event) {
    const key = event.target.value;
    const nextProfile = { ...samples[key] };

    setSelectedSample(key);
    setProfile(nextProfile);
    setDraft(nextProfile);
    setScenario(zeroScenario());
    setIsSample(true);
    setNotice("");
    setToast("Fictional sample loaded.");
  }

  async function importCSV(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      if (file.size > 1024 * 1024) {
        throw new Error(
          "Choose a CSV smaller than 1 MB."
        );
      }

      const imported = parseFinancialCSV(
        await file.text()
      );

      const nextProfile = validateProfile({
        ...profile,
        ...imported,
      });

      setProfile(nextProfile);
      setDraft(nextProfile);
      setScenario(zeroScenario());
      setIsSample(false);
      setNotice("");

      setToast(
        `Imported ${imported.month}. Review the growth assumption before proceeding.`
      );
    } catch (error) {
      setNotice(error.message);
    } finally {
      event.target.value = "";
    }
  }

  function saveSnapshot(kind) {
    const entry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      kind,
      profile: { ...profile },
      scenario: { ...scenario },
      isSample,
    };

    setHistory((previous) =>
      [entry, ...previous].slice(0, 40)
    );

    setToast(
      kind === "scenario"
        ? "Scenario saved as a projection."
        : "Actual input snapshot saved."
    );
  }

  function clearData() {
    const confirmed = window.confirm(
      "Clear the saved profile and all snapshots on this device?"
    );

    if (!confirmed) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The UI still resets if browser storage is blocked.
    }

    const initialProfile = { ...samples.studio };

    setProfile(initialProfile);
    setDraft(initialProfile);
    setScenario(zeroScenario());
    setHistory([]);
    setIsSample(true);
    setSelectedSample("studio");
    setAccessToken("");
    setToast("Previous data cleared. Sample restored.");
  }

  function exportReport() {
    const report = {
      product: "StartupShield",
      createdAt: new Date().toISOString(),
      currency: "USD",
      dataKind: isSample
        ? "fictional sample"
        : "user-entered",
      profile,
      baseline,
      scenario: {
        assumptions: scenario,
        result: scenarioResult,
      },
      historicalCases: matchedCases,
      history,
      methodology:
        "Simplified 24-month cash model. Revenue compounds at net monthly growth. AI expenses scale with that growth; other expenses remain fixed. Taxes, financing, collections delays, seasonality, and implementation costs are not modeled. Historical outcomes do not establish causation.",
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "startupshield-report.json";
    anchor.click();

    setTimeout(
      () => URL.revokeObjectURL(url),
      1000
    );

    setToast("Report exported.");
  }

  async function generateAIExplanation() {
    setAiLoading(true);
    setAiText("Preparing your explanation…");

    try {
      const { name, ...anonymousProfile } = profile;

      const response = await fetch(
        "/api/insights",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            profile: anonymousProfile,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "The explanation is unavailable."
        );
      }

      const heading =
        result.mode === "ai"
          ? "AI explanation · review before acting"
          : "Calculated explanation · AI is not configured";

      setAiText(`${heading}\n\n${result.text}`);
    } catch (error) {
      setAiText(
        `${error.message}\n\nYour calculated financial brief remains available above.`
      );
    } finally {
      setAiLoading(false);
    }
  }

  function handleTabKey(event, index) {
    let nextIndex = index;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setActiveTab(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  function openStory(companyId) {
    setSearch(companyId);
    setActiveTab("cases");
  }

  const scenarioDifference =
    scenarioResult.series[12].cash -
    baseline.series[12].cash;

  return (
    <>
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>

      <header className="navigation">
        <a
          className="wordmark"
          href="#"
          aria-label="StartupShield home"
        >
          startup<span>shield</span>
          <sup>↗</sup>
        </a>

        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#stories">Company stories</a>
          <a href="#method">Our approach</a>
        </nav>

        <a
          className="button blue small"
          href="#workspace"
        >
          Open workspace <span>↗</span>
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow">
            <span className="dot" />
            A LITTLE FORESIGHT. A LONGER FUTURE.
          </div>

          <h1>
            Your next chapter.
            <br />
            <em>Better informed.</em>
          </h1>

          <p>
            You built something worth believing in.
            <br />
            Understand your finances. Explore your
            options. Keep going.
          </p>

          <div className="hero-actions">
            <a
              className="button blue"
              href="#workspace"
            >
              Find your financial footing
              <span>↗</span>
            </a>

            <a
              className="text-link"
              href="#stories"
            >
              Learn from real companies ↗
            </a>
          </div>

          <div className="hero-note">
            No bank connection. No signup. Start with
            a sample.
          </div>

          <div
            className="hero-object"
            aria-hidden="true"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="sculpture">
              <div className="shield-shape">
                <span>↗</span>
              </div>
            </div>

            <div className="floating-card first">
              <span className="check-dot">✓</span>

              <div>
                Less guesswork.
                <strong>More perspective.</strong>
              </div>

              <span className="round-arrow">↗</span>
            </div>

            <div className="floating-card second">
              <span className="spark">✧</span>

              <div>
                A clearer view of
                <strong>what comes next.</strong>
              </div>
            </div>

            <span className="object-caption">
              BUILT FOR THE BUSINESS YOU’RE BUILDING
            </span>
          </div>

          <div className="hero-bottom">
            <span>YOUR NUMBERS, WITH CONTEXT.</span>

            <div>
              <span>01 &nbsp; Understand</span>
              <span>02 &nbsp; Learn</span>
              <span>03 &nbsp; Explore</span>
            </div>
          </div>
        </section>

        <section
          className="section introduction"
          id="how-it-works"
        >
          <div className="eyebrow">
            THE BIG PICTURE
          </div>

          <h2>
            Good decisions start
            <br />
            with a <em>clearer view.</em>
          </h2>

          <div className="introduction-grid">
            <article>
              <span className="step">
                01 / UNDERSTAND
              </span>

              <h3>See beyond the balance.</h3>

              <p>
                Turn your revenue, expenses, and cash
                into an understandable view of what’s
                ahead.
              </p>
            </article>

            <article>
              <span className="step">
                02 / LEARN
              </span>

              <h3>You’re not the first.</h3>

              <p>
                Explore documented company
                experiences, with sources and the
                context that makes them useful.
              </p>
            </article>

            <article>
              <span className="step">
                03 / EXPLORE
              </span>

              <h3>Try the next move.</h3>

              <p>
                Compare possible changes before
                committing. See the assumptions
                behind every projection.
              </p>
            </article>
          </div>
        </section>

        <section
          className="section workspace"
          id="workspace"
        >
          <div className="workspace-heading">
            <div>
              <div className="eyebrow">
                YOUR WORKSPACE
              </div>

              <h2>
                Let’s look <em>ahead.</em>
              </h2>
            </div>

            <div className="workspace-actions">
              <span className="storage-label">
                {storageAvailable
                  ? "Stored on this device only"
                  : "Storage unavailable · session only"}
              </span>

              <button
                className="button outline small"
                onClick={exportReport}
              >
                Export report ↗
              </button>
            </div>
          </div>

          <div className="workspace-shell">
            <div className="workspace-top">
              <div className="business-identity">
                <span className="dot" />

                <strong>{profile.name}</strong>

                <span className="sample-tag">
                  {isSample
                    ? "SAMPLE BUSINESS"
                    : "YOUR INPUTS"}
                </span>
              </div>

              <label className="sample-select">
                Try a sample

                <select
                  value={selectedSample}
                  onChange={loadSample}
                >
                  <option value="studio">
                    AI software studio
                  </option>

                  <option value="cafe">
                    Neighborhood café
                  </option>

                  <option value="agency">
                    Creative agency
                  </option>
                </select>
              </label>
            </div>

            <div
              className="tabs"
              role="tablist"
              aria-label="Workspace views"
            >
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={
                    activeTab === tab.id
                  }
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={
                    activeTab === tab.id ? 0 : -1
                  }
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  onKeyDown={(event) =>
                    handleTabKey(event, index)
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {notice && (
              <div
                className="notice"
                role="alert"
              >
                {notice}
              </div>
            )}

            <section
              className="tab-panel"
              id="panel-overview"
              role="tabpanel"
              aria-labelledby="tab-overview"
              hidden={activeTab !== "overview"}
            >
              <div className="dashboard-grid">
                <aside className="input-panel">
                  <div className="panel-heading">
                    <h3>
                      Your business, in numbers.
                    </h3>

                    <span>USD / MONTH</span>
                  </div>

                  <form onSubmit={updateProfile}>
                    <label>
                      Business name

                      <input
                        name="name"
                        value={draft.name}
                        onChange={changeDraft}
                        maxLength={80}
                        required
                      />
                    </label>

                    <label>
                      Business type

                      <select
                        name="industry"
                        value={draft.industry}
                        onChange={changeDraft}
                      >
                        <option>Software / AI</option>
                        <option>Local business</option>
                        <option>Services</option>
                        <option>Other</option>
                      </select>
                    </label>

                    <div className="field-pair">
                      <NumberField
                        name="cash"
                        label="Cash on hand ($)"
                        value={draft.cash}
                        onChange={changeDraft}
                      />

                      <NumberField
                        name="revenue"
                        label="Monthly revenue ($)"
                        value={draft.revenue}
                        onChange={changeDraft}
                      />
                    </div>

                    <div className="field-rule">
                      MONTHLY CASH EXPENSES
                    </div>

                    <div className="field-pair">
                      <NumberField
                        name="payroll"
                        label="Payroll ($)"
                        value={draft.payroll}
                        onChange={changeDraft}
                      />

                      <NumberField
                        name="operations"
                        label="Operations ($)"
                        value={draft.operations}
                        onChange={changeDraft}
                      />

                      <NumberField
                        name="marketing"
                        label="Marketing ($)"
                        value={draft.marketing}
                        onChange={changeDraft}
                      />

                      <NumberField
                        name="aiCosts"
                        label="AI / API costs ($)"
                        value={draft.aiCosts}
                        onChange={changeDraft}
                      />
                    </div>

                    <details className="input-details">
                      <summary>
                        Growth & customer assumptions
                      </summary>

                      <div className="field-pair">
                        <NumberField
                          name="growth"
                          label="Net revenue growth (%/mo)"
                          value={draft.growth}
                          min={-50}
                          max={100}
                          onChange={changeDraft}
                        />

                        <NumberField
                          name="churn"
                          label="Customer churn (%/mo)"
                          value={draft.churn}
                          max={100}
                          onChange={changeDraft}
                        />

                        <NumberField
                          name="customers"
                          label="Paying customers"
                          value={draft.customers}
                          onChange={changeDraft}
                        />

                        <NumberField
                          name="concentration"
                          label="Largest customer (% revenue)"
                          value={draft.concentration}
                          max={100}
                          onChange={changeDraft}
                        />
                      </div>
                    </details>

                    <button
                      className="button blue full"
                      type="submit"
                    >
                      Update my outlook
                      <span>↗</span>
                    </button>
                  </form>

                  <div className="upload-actions">
                    <button
                      className="text-link"
                      onClick={() =>
                        fileInput.current?.click()
                      }
                    >
                      ↑ Import monthly CSV
                    </button>

                    <a
                      href="/sample-financials.csv"
                      download
                    >
                      Download template
                    </a>

                    <input
                      ref={fileInput}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={importCSV}
                      hidden
                      aria-label="Upload monthly financial CSV"
                    />
                  </div>

                  <p className="fine">
                    CSV uses the latest month’s cash
                    and expenses. Growth is inferred
                    from the last two revenue rows,
                    within −50% to +100%. Review
                    imported assumptions. Sample
                    businesses are fictional.
                  </p>
                </aside>

                <div className="analysis-panel">
                  <div className="outlook-heading">
                    <span className="eyebrow">
                      THE OUTLOOK
                    </span>

                    <span className="status-pill">
                      {baseline.status}
                    </span>
                  </div>

                  <div className="metrics">
                    <Metric
                      label="Projected cash runway"
                      value={runwayLabel(baseline)}
                      note="months · current assumptions"
                    />

                    <Metric
                      label="Monthly net burn"
                      value={money(baseline.burn)}
                      note="first-month cash shortfall"
                    />

                    <Metric
                      label="Cash on hand"
                      value={money(profile.cash)}
                      note="starting cash balance"
                    />
                  </div>

                  <div className="chart-card">
                    <div className="chart-heading">
                      <div>
                        <h3>
                          A little perspective on
                          your cash.
                        </h3>

                        <p>
                          Projected cash balance ·
                          next 12 months
                        </p>
                      </div>

                      <span className="legend">
                        <i /> Current path
                      </span>
                    </div>

                    <CashChart
                      baseline={baseline}
                      id="overview"
                    />

                    <p className="chart-note">
                      A projection, not a prediction.
                      Based on the entered
                      assumptions.
                    </p>
                  </div>

                  <div className="findings-heading">
                    <h3>Worth a closer look</h3>

                    <button
                      className="text-link"
                      onClick={() =>
                        setActiveTab("scenarios")
                      }
                    >
                      Explore your options ↗
                    </button>
                  </div>

                  <div className="warnings">
                    {baseline.warnings.length ? (
                      baseline.warnings.map(
                        (warning) => (
                          <article
                            className="warning"
                            key={warning.id}
                          >
                            <span className="warning-icon">
                              !
                            </span>

                            <div>
                              <h4>
                                {warning.title}
                              </h4>

                              <p>
                                {warning.detail}
                              </p>

                              <span className="warning-level">
                                {warning.level}
                              </span>
                            </div>
                          </article>
                        )
                      )
                    ) : (
                      <article className="warning">
                        <span className="warning-icon">
                          ✓
                        </span>

                        <div>
                          <h4>
                            No flags under the
                            current rules
                          </h4>

                          <p>
                            This is not a guarantee
                            of financial health.
                            Review assumptions
                            regularly.
                          </p>
                        </div>
                      </article>
                    )}
                  </div>

                  <div className="financial-brief">
                    <span className="spark">✧</span>

                    <div>
                      <span className="eyebrow">
                        YOUR FINANCIAL BRIEF
                      </span>

                      <p>
                        {explain(profile, baseline)}
                      </p>

                      <details className="ai-details">
                        <summary>
                          Get an optional AI
                          explanation
                        </summary>

                        <p className="fine">
                          When you click Generate,
                          your numeric profile and
                          public case summaries are
                          sent to the configured AI
                          provider. Your business
                          name is excluded.
                        </p>

                        <label>
                          Demo access token

                          <input
                            type="password"
                            value={accessToken}
                            onChange={(event) =>
                              setAccessToken(
                                event.target.value
                              )
                            }
                            autoComplete="off"
                            placeholder="Ask the deployment owner"
                          />
                        </label>

                        <button
                          className="button outline small"
                          onClick={
                            generateAIExplanation
                          }
                          disabled={aiLoading}
                        >
                          {aiLoading
                            ? "Preparing…"
                            : "Generate explanation ✧"}
                        </button>

                        {aiText && (
                          <p
                            className="ai-output"
                            role="status"
                          >
                            {aiText}
                          </p>
                        )}
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              className="tab-panel"
              id="panel-scenarios"
              role="tabpanel"
              aria-labelledby="tab-scenarios"
              hidden={activeTab !== "scenarios"}
            >
              <div className="scenario-layout">
                <div className="scenario-controls">
                  <span className="eyebrow">
                    DIFFERENT POSSIBILITIES
                  </span>

                  <h3 className="display-small">
                    What if you
                    <br />
                    <em>changed the plan?</em>
                  </h3>

                  <p>
                    Adjust an assumption. See how the
                    next chapter could look.
                  </p>

                  {sliderDefinitions.map(
                    (definition) => (
                      <div
                        className="slider-field"
                        key={definition.key}
                      >
                        <div className="slider-label">
                          <label
                            htmlFor={`slider-${definition.key}`}
                          >
                            {definition.label}
                          </label>

                          <output
                            htmlFor={`slider-${definition.key}`}
                          >
                            {scenario[
                              definition.key
                            ] > 0
                              ? "+"
                              : ""}
                            {
                              scenario[
                                definition.key
                              ]
                            }
                            %
                          </output>
                        </div>

                        <input
                          id={`slider-${definition.key}`}
                          type="range"
                          min={definition.min}
                          max={definition.max}
                          step={1}
                          value={
                            scenario[
                              definition.key
                            ]
                          }
                          onChange={(event) => {
                            const value = Number(
                              event.target.value
                            );

                            setScenario(
                              (previous) => ({
                                ...previous,
                                [definition.key]:
                                  value,
                              })
                            );
                          }}
                        />
                      </div>
                    )
                  )}

                  <button
                    className="text-link reset-link"
                    onClick={() =>
                      setScenario(zeroScenario())
                    }
                  >
                    Reset assumptions ↺
                  </button>

                  <p className="fine">
                    Price changes apply immediately
                    to all revenue. Customer loss is
                    modeled separately. General cost
                    reductions exclude AI costs.
                    Transition costs and behavioral
                    effects are not modeled.
                  </p>
                </div>

                <div className="scenario-results">
                  <div className="metrics">
                    <Metric
                      label="Projected runway"
                      value={runwayLabel(
                        scenarioResult
                      )}
                      note="months · scenario assumptions"
                    />

                    <Metric
                      label="First-month cash flow"
                      value={money(
                        scenarioResult.net
                      )}
                      note="revenue minus expenses"
                    />

                    <Metric
                      label="12-month cash"
                      value={money(
                        scenarioResult.series[12]
                          .cash
                      )}
                      note="under scenario assumptions"
                    />
                  </div>

                  <div className="chart-card">
                    <div className="chart-heading">
                      <h3>
                        Two paths.
                        One clearer decision.
                      </h3>

                      <span className="legend">
                        <i className="gray" />
                        Baseline
                        <i />
                        Scenario
                      </span>
                    </div>

                    <CashChart
                      baseline={baseline}
                      scenario={scenarioResult}
                      id="scenario"
                    />
                  </div>

                  <p
                    className="scenario-summary"
                    aria-live="polite"
                  >
                    Under these assumptions,
                    month-12 cash is{" "}
                    <strong>
                      {money(
                        Math.abs(
                          scenarioDifference
                        )
                      )}
                    </strong>{" "}
                    {scenarioDifference >= 0
                      ? "higher"
                      : "lower"}{" "}
                    than the baseline.
                  </p>

                  <button
                    className="button blue"
                    onClick={() =>
                      saveSnapshot("scenario")
                    }
                  >
                    Save this scenario
                    <span>↗</span>
                  </button>

                  <p className="fine">
                    Saving records a projection.
                    It does not implement a change
                    or validate a real-world effect.
                  </p>
                </div>
              </div>
            </section>

            <section
              className="tab-panel"
              id="panel-cases"
              role="tabpanel"
              aria-labelledby="tab-cases"
              hidden={activeTab !== "cases"}
            >
              <div className="cases-heading">
                <div>
                  <span className="eyebrow">
                    CONTEXT, NOT A CRYSTAL BALL
                  </span>

                  <h3 className="display-small">
                    Other chapters.
                    <br />
                    <em>Useful perspective.</em>
                  </h3>
                </div>

                <label className="case-search">
                  Search the case library

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Company or challenge"
                  />
                </label>
              </div>

              <div className="case-grid">
                {filteredCases.length ? (
                  filteredCases.map(
                    (companyCase) => (
                      <CaseCard
                        key={companyCase.id}
                        companyCase={companyCase}
                      />
                    )
                  )
                ) : (
                  <div className="empty-state">
                    No cases match your search.
                    Try “cash” or “Buffer”.
                  </div>
                )}
              </div>

              <p className="fine">
                Curated public sources, not live web
                search. Matching uses shared risk
                tags, not statistical similarity.
                The library currently contains two
                companies. Reported outcomes do not
                establish causation.
              </p>
            </section>

            <section
              className="tab-panel"
              id="panel-progress"
              role="tabpanel"
              aria-labelledby="tab-progress"
              hidden={activeTab !== "progress"}
            >
              <div className="cases-heading">
                <div>
                  <span className="eyebrow">
                    KEEP YOUR PERSPECTIVE
                  </span>

                  <h3 className="display-small">
                    A record of
                    <br />
                    <em>your next moves.</em>
                  </h3>
                </div>

                <button
                  className="button blue small"
                  onClick={() =>
                    saveSnapshot("actuals")
                  }
                >
                  Save current actuals +
                </button>
              </div>

              <p className="progress-description">
                Update your inputs over time, then
                save a snapshot. Scenario projections
                remain separate from user-entered
                actuals.
              </p>

              <div className="history-list">
                {history.length ? (
                  history.map((entry) => {
                    const result = forecast(
                      entry.profile,
                      entry.kind === "scenario"
                        ? entry.scenario
                        : zeroScenario()
                    );

                    return (
                      <article
                        className="history-item"
                        key={entry.id}
                      >
                        <div>
                          <span className="history-kind">
                            {entry.kind ===
                            "scenario"
                              ? "SAVED PROJECTION"
                              : "ACTUAL INPUT SNAPSHOT"}
                            {" · "}
                            {entry.isSample
                              ? "FICTIONAL SAMPLE"
                              : "USER-ENTERED"}
                          </span>

                          <h4>
                            {entry.profile.name}
                          </h4>

                          <p>
                            {new Date(
                              entry.date
                            ).toLocaleString()}
                          </p>

                          <p>
                            Cash{" "}
                            {money(
                              entry.profile.cash
                            )}
                            {" · "}
                            First-month cash flow{" "}
                            {money(result.net)}
                            {" · "}
                            Modeled runway{" "}
                            {runwayLabel(result)}{" "}
                            months
                          </p>

                          {entry.kind ===
                            "scenario" && (
                            <p>
                              Price{" "}
                              {
                                entry.scenario
                                  .price
                              }
                              % · General cost
                              reduction{" "}
                              {
                                entry.scenario
                                  .cost
                              }
                              % · AI cost reduction{" "}
                              {entry.scenario.ai}%
                              · Customer loss{" "}
                              {
                                entry.scenario
                                  .loss
                              }
                              %
                            </p>
                          )}
                        </div>

                        <button
                          className="text-link"
                          onClick={() => {
                            setHistory(
                              (previous) =>
                                previous.filter(
                                  (item) =>
                                    item.id !==
                                    entry.id
                                )
                            );
                          }}
                        >
                          Remove
                        </button>
                      </article>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    Your next chapter starts here.
                    <br />
                    Save a snapshot or scenario to
                    build your record.
                  </div>
                )}
              </div>

              <button
                className="text-link danger"
                onClick={clearData}
              >
                Clear saved data on this device
              </button>
            </section>
          </div>

          <div
            className="methodology"
            id="method"
          >
            <details>
              <summary>
                How the numbers work
              </summary>

              <p>
                Monthly cash flow equals revenue
                minus payroll, operations, marketing,
                and AI costs. Revenue compounds at
                your entered net monthly growth
                rate. AI costs grow at that same
                rate; other expenses remain fixed.
              </p>

              <p>
                The model projects 24 months. Charts
                display the first 12. Runway is the
                first zero crossing, interpolated
                within that month. “24+” means cash
                did not reach zero during the
                modeled horizon, not that cash will
                last forever.
              </p>

              <p>
                Churn is a diagnostic input and is
                not subtracted again from net
                revenue growth. Taxes, financing,
                collections delays, seasonality, and
                implementation costs are not
                separately modeled.
              </p>

              <p>
                Alerts use prototype heuristics:
                runway below six months, negative
                first-month cash flow, AI costs above
                15% of revenue, churn above 5%, or a
                customer representing over 30% of
                revenue. These are not validated
                industry benchmarks, failure
                probabilities, or credit scores.
              </p>
            </details>
          </div>
        </section>

        <section
          className="section stories"
          id="stories"
        >
          <div className="stories-heading">
            <div>
              <span className="eyebrow">
                BORROW PERSPECTIVE.
                BUILD YOUR OWN PATH.
              </span>

              <h2>
                Every business
                <br />
                has a <em>backstory.</em>
              </h2>
            </div>

            <p>
              The hard lessons don’t have
              to be yours alone.
              <br />
              Explore real experiences,
              with the receipts.
            </p>
          </div>

          <div className="editorial-grid">
            {companyCases.map(
              (companyCase, index) => (
                <article
                  className={`editorial-card ${companyCase.color}`}
                  key={companyCase.id}
                >
                  <span className="eyebrow">
                    0{index + 1} /{" "}
                    {companyCase.category.toUpperCase()}
                  </span>

                  <div className="editorial-symbol">
                    {companyCase.symbol}
                  </div>

                  <h3>
                    {index === 0 ? (
                      <>
                        When growth
                        <br />
                        outpaced the plan.
                      </>
                    ) : (
                      <>
                        Eight weeks of cash.
                        <br />
                        A longer view.
                      </>
                    )}
                  </h3>

                  <p>
                    {companyCase.company}
                    {" · "}
                    {companyCase.year}
                  </p>

                  <a
                    className="button outline small"
                    href="#workspace"
                    onClick={() =>
                      openStory(
                        companyCase.id
                      )
                    }
                  >
                    Read the story ↗
                  </a>
                </article>
              )
            )}

            <div className="editorial-aside">
              <span className="spark">✧</span>

              <h3>
                Evidence.
                <br />
                <em>Not promises.</em>
              </h3>

              <p>
                Every case links to its source,
                distinguishes reported facts from
                interpretation, and explains where
                the comparison falls short.
              </p>

              <a
                className="text-link"
                href="#method"
              >
                Read our approach ↗
              </a>
            </div>
          </div>
        </section>

        <section className="section closing">
          <span className="eyebrow">
            FOR WHAT COMES NEXT
          </span>

          <h2>
            A little less uncertainty.
            <br />
            A little more <em>possibility.</em>
          </h2>

          <a
            className="button light"
            href="#workspace"
          >
            Find your footing
            <span>↗</span>
          </a>

          <div className="closing-line">
            <span>Understand.</span>
            <span>Learn.</span>
            <span>Explore.</span>
          </div>
        </section>
      </main>

      <footer>
        <a
          className="wordmark"
          href="#"
        >
          startup<span>shield</span>
          <sup>↗</sup>
        </a>

        <p>
          A clearer view for first-time founders.
        </p>

        <span>
          Buildathon prototype · Financial education,
          not professional advice.
        </span>
      </footer>

      {toast && (
        <div
          className="toast"
          role="status"
        >
          {toast}
        </div>
      )}
    </>
  );
}
