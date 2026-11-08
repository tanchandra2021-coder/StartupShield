"use client";

import { useState } from "react";

export default function MarketPage() {
  const [form, setForm] = useState({
    product: "",
    customer: "",
    location: "",
    price: "",
    difference: "",
    evidence: "",
  });

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const fields = [
    ["product", "What does your product do?", 1500],
    ["customer", "Who is the specific target buyer?", 500],
    ["location", "Which country, city, or market?", 200],
    ["price", "Your proposed price and currency (optional)", 200],
    ["difference", "Why would a buyer choose you? (optional)", 700],
    [
      "evidence",
      "Actual customer evidence: paid pilots, conversions, retention (optional)",
      1500,
    ],
  ];

  async function research(event) {
    event.preventDefault();

    setBusy(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/market", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },

        body: JSON.stringify(form),
        signal: AbortSignal.timeout(55_000),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Research failed.");
      }

      setResult(data);
    } catch (error) {
      setError(
        error.name === "TimeoutError"
          ? "Request timed out. Try a narrower market."
          : error.message
      );
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = {
    font: "inherit",
    padding: 12,
    border: "1px solid #d5d8cc",
    borderRadius: 9,
    background: "#fffefa",
  };

  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "auto",
        padding: "35px 22px",
        color: "#34372f",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <a href="/">startupshield ↗</a>

      <h1
        style={{
          fontFamily: "Georgia, serif",
          fontWeight: 400,
          fontSize: "clamp(40px, 6vw, 68px)",
        }}
      >
        A clearer view of your market.
      </h1>

      <p>
        Research competitors and assess the evidence for demand
        using Google Search sources.
      </p>

      <p style={{ color: "#72766b", fontSize: 13 }}>
        Your description is sent to Google. Public searches may
        use parts of it. Do not include customer identities or
        confidential information.
      </p>

      <form
        onSubmit={research}
        style={{
          display: "grid",
          gap: 18,
          marginTop: 30,
        }}
      >
        {fields.map(([key, label, maximum]) => (
          <label
            key={key}
            style={{
              display: "grid",
              gap: 7,
              fontSize: 14,
            }}
          >
            {label}

            <textarea
              required={[
                "product",
                "customer",
                "location",
              ].includes(key)}
              maxLength={maximum}
              rows={
                key === "product" || key === "evidence"
                  ? 3
                  : 2
              }
              value={form[key]}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  [key]: event.target.value,
                }))
              }
              style={inputStyle}
            />
          </label>
        ))}

        <label style={{ display: "grid", gap: 7 }}>
          Deployment access password

          <input
            type="password"
            required
            autoComplete="off"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Your INSIGHTS_ACCESS_TOKEN value—not your Gemini key"
            style={inputStyle}
          />
        </label>

        <button
          disabled={busy}
          type="submit"
          style={{
            padding: "15px 25px",
            border: 0,
            borderRadius: 30,
            background: "#153cbd",
            color: "white",
            fontSize: 16,
            cursor: busy ? "wait" : "pointer",
          }}
        >
          {busy
            ? "Researching current sources…"
            : "Research my market ↗"}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          style={{
            padding: 18,
            background: "#faeeee",
            borderRadius: 9,
          }}
        >
          {error}
        </p>
      )}

      {result && (
        <section
          aria-label="Market research results"
          style={{ marginTop: 35 }}
        >
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 400,
              fontSize: 34,
            }}
          >
            Your market brief.
          </h2>

          <p style={{ fontSize: 12, color: "#72766b" }}>
            Research completed:{" "}
            {new Date(result.researchedAt).toLocaleString()}.
            This is a search-backed interpretation, not proof
            of demand. Verify source dates and claims.
          </p>

          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              padding: 25,
              background: "#f0f2fa",
              borderRadius: 12,
            }}
          >
            {result.report}
          </div>

          <h3>Sources returned by Google Search</h3>

          <ol style={{ paddingLeft: 25 }}>
            {result.sources.map((source) => (
              <li
                key={source.id}
                value={source.id}
                style={{ margin: "12px 0" }}
              >
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.title} ↗
                </a>
              </li>
            ))}
          </ol>

          {result.searchSuggestions && (
            <iframe
              title="Google Search suggestions"
              srcDoc={result.searchSuggestions}
              sandbox="allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: 220,
                border: 0,
                marginTop: 15,
              }}
            />
          )}

          <p>
            <a href="/diagnostics">
              Check your own conversion and retention metrics ↗
            </a>
          </p>
        </section>
      )}
    </main>
  );
}
