export const CURRENCY = "USD";

export const numericFields = [
  "cash",
  "revenue",
  "payroll",
  "operations",
  "marketing",
  "aiCosts",
  "growth",
  "churn",
  "customers",
  "concentration",
];

export const samples = {
  studio: {
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
  },

  cafe: {
    name: "Corner Coffee",
    industry: "Local business",
    cash: 18000,
    revenue: 24000,
    payroll: 13000,
    operations: 11000,
    marketing: 1200,
    aiCosts: 0,
    growth: 0,
    churn: 0,
    customers: 800,
    concentration: 2,
  },

  agency: {
    name: "Northline Creative",
    industry: "Services",
    cash: 28000,
    revenue: 18000,
    payroll: 10000,
    operations: 2500,
    marketing: 1000,
    aiCosts: 500,
    growth: 0,
    churn: 0,
    customers: 8,
    concentration: 55,
  },
};

export function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
}

export function zeroScenario() {
  return {
    price: 0,
    cost: 0,
    ai: 0,
    loss: 0,
  };
}

export function validateProfile(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Enter a business profile.");
  }

  const result = {
    name: String(input.name || "My business").trim().slice(0, 80),
    industry: String(input.industry || "Software / AI").slice(0, 60),
  };

  for (const key of numericFields) {
    const raw = input[key];

    if (
      raw === null ||
      raw === undefined ||
      typeof raw === "boolean" ||
      (typeof raw === "string" && !raw.trim())
    ) {
      throw new Error(`Enter a valid number for ${key}.`);
    }

    const value = Number(raw);

    if (!Number.isFinite(value)) {
      throw new Error(`Enter a valid number for ${key}.`);
    }

    const min = key === "growth" ? -50 : 0;

    const max = ["growth", "churn", "concentration"].includes(key)
      ? 100
      : 10_000_000_000;

    if (value < min || value > max) {
      throw new Error(`${key} must be between ${min} and ${max}.`);
    }

    result[key] = value;
  }

  return result;
}

function validateScenario(input) {
  const scenario = {
    ...zeroScenario(),
    ...input,
  };

  const ranges = {
    price: [-20, 50],
    cost: [0, 50],
    ai: [0, 80],
    loss: [0, 50],
  };

  for (const [key, range] of Object.entries(ranges)) {
    const value = scenario[key];

    if (
      !Number.isFinite(value) ||
      value < range[0] ||
      value > range[1]
    ) {
      throw new Error(`Invalid scenario value for ${key}.`);
    }
  }

  return scenario;
}

export function forecast(rawProfile, rawScenario = zeroScenario()) {
  const profile = validateProfile(rawProfile);
  const scenario = validateScenario(rawScenario);

  const revenue =
    profile.revenue *
    (1 + scenario.price / 100) *
    (1 - scenario.loss / 100);

  const fixedExpenses =
    (profile.payroll + profile.operations + profile.marketing) *
    (1 - scenario.cost / 100);

  const aiExpenses = profile.aiCosts * (1 - scenario.ai / 100);

  const expenses = fixedExpenses + aiExpenses;
  const net = revenue - expenses;

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
    const growthFactor = Math.pow(
      1 + profile.growth / 100,
      month - 1
    );

    const incoming = revenue * growthFactor;

    // AI costs scale with modeled business usage.
    // Other cash expenses remain fixed.
    const outgoing =
      fixedExpenses + aiExpenses * growthFactor;

    const previousCash = cash;
    cash += incoming - outgoing;

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
      revenue: incoming,
      expenses: outgoing,
    });
  }

  const warnings = [];

  if (runway !== null && runway < 6) {
    warnings.push({
      id: "cash",
      title: "Your cash cushion needs attention",
      detail: `Cash reaches zero in about ${runway.toFixed(
        1
      )} months under these assumptions.`,
      level: runway < 3 ? "High priority" : "Watch closely",
    });
  }

  if (net < 0) {
    warnings.push({
      id: "burn",
      title: "Spending is ahead of revenue",
      detail: `The first month has ${money(
        -net
      )} more going out than coming in.`,
      level: "Watch closely",
    });
  }

  if (
    profile.revenue > 0 &&
    profile.aiCosts / profile.revenue > 0.15
  ) {
    warnings.push({
      id: "ai",
      title: "AI usage is a meaningful cost",
      detail: `AI costs equal ${(
        (profile.aiCosts / profile.revenue) *
        100
      ).toFixed(
        0
      )}% of current revenue. Investigate heavy-user behavior.`,
      level: "Review usage",
    });
  }

  if (profile.churn > 5) {
    warnings.push({
      id: "retention",
      title: "Retention deserves a closer look",
      detail: `You entered ${profile.churn}% monthly customer churn. Review individual customer cohorts.`,
      level: "Review retention",
    });
  }

  if (profile.concentration > 30) {
    warnings.push({
      id: "concentration",
      title: "One customer carries a lot of weight",
      detail: `Your largest customer represents ${profile.concentration}% of revenue. Try a revenue-loss scenario.`,
      level: "Review exposure",
    });
  }

  const status =
    runway !== null && runway < 3
      ? "Needs attention"
      : warnings.length
        ? "Room to improve"
        : "Steady outlook";

  return {
    revenue,
    expenses,
    net,
    burn: Math.max(0, -net),
    runway,
    series,
    warnings,
    status,
  };
}

export function runwayLabel(result) {
  return result.runway === null
    ? "24+"
    : result.runway.toFixed(1);
}

export function explain(profile, result) {
  const cashFlow =
    result.net < 0
      ? `At current first-month levels, ${money(
          result.expenses
        )} of expenses exceeds ${money(
          result.revenue
        )} of revenue by ${money(result.burn)}.`
      : `At current first-month levels, revenue exceeds expenses by ${money(
          result.net
        )}.`;

  const runway =
    result.runway === null
      ? "Cash stays above zero within the 24-month model."
      : `The projection reaches zero after approximately ${result.runway.toFixed(
          1
        )} months.`;

  return `${cashFlow} ${runway} Compare a cost reduction with a pricing scenario, then include possible customer loss. Historical cases provide context, not proof that an intervention will work.`;
}

export function parseFinancialCSV(text) {
  text = text.replace(/^\uFEFF/, "");

  const rows = [];

  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const character = text[i];

    if (character === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted || cell === "") {
        quoted = !quoted;
      } else {
        throw new Error("Unexpected quote in CSV.");
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if (
      (character === "\n" || character === "\r") &&
      !quoted
    ) {
      if (character === "\r" && text[i + 1] === "\n") {
        i++;
      }

      row.push(cell);

      if (row.some((value) => value.trim())) {
        rows.push(row);
      }

      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) {
    throw new Error("CSV contains an unclosed quote.");
  }

  row.push(cell);

  if (row.some((value) => value.trim())) {
    rows.push(row);
  }

  if (rows.length < 2) {
    throw new Error(
      "Include a header and at least one monthly row."
    );
  }

  const headers = rows
    .shift()
    .map((value) => value.trim().toLowerCase());

  const required = [
    "month",
    "cash",
    "revenue",
    "payroll",
    "operations",
    "marketing",
    "aicosts",
  ];

  if (required.some((key) => !headers.includes(key))) {
    throw new Error(
      "Use the sample CSV headers: month,cash,revenue,payroll,operations,marketing,aiCosts."
    );
  }

  const records = rows
    .map((values) => {
      if (values.length !== headers.length) {
        throw new Error(
          "Each CSV row must match the header width."
        );
      }

      const record = Object.fromEntries(
        headers.map((header, index) => [
          header,
          values[index].trim(),
        ])
      );

      if (
        !/^\d{4}-(0[1-9]|1[0-2])$/.test(record.month)
      ) {
        throw new Error("Months must use YYYY-MM.");
      }

      for (const key of required.slice(1)) {
        const value = Number(record[key]);

        if (
          record[key] === "" ||
          !Number.isFinite(value) ||
          value < 0
        ) {
          throw new Error(
            `Invalid ${key} in ${record.month}.`
          );
        }

        record[key] = value;
      }

      return record;
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  if (
    new Set(records.map((record) => record.month)).size !==
    records.length
  ) {
    throw new Error(
      "Use one aggregate row per month."
    );
  }

  const latest = records.at(-1);
  const previous = records.at(-2);

  const inferredGrowth =
    previous?.revenue > 0
      ? (latest.revenue / previous.revenue - 1) * 100
      : 0;

  return {
    month: latest.month,
    cash: latest.cash,
    revenue: latest.revenue,
    payroll: latest.payroll,
    operations: latest.operations,
    marketing: latest.marketing,
    aiCosts: latest.aicosts,
    growth: Math.max(-50, Math.min(100, inferredGrowth)),
  };
}
