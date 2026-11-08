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

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const fields = [
    [
      "product",
      "What does your product do?",
      1500,
    ],
    [
      "customer",
      "Who is the specific target buyer?",
      500,
    ],
    [
      "location",
      "Which country, city, or market?",
      200,
    ],
    [
      "price",
      "Your proposed price and currency (optional)",
      200,
    ],
    [
      "difference",
      "Why would a buyer choose you? (optional)",
      700,
    ],
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
        },

        body: JSON.stringify(form),

        signal: AbortSignal.timeout(55_000),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Research failed."
        );
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
    width: "100%",
    boxSizing: "border-box",
    font: "inherit",
    padding: 14,
    border: "1px solid #d5d8cc",
    borderRadius: 9,
    background: "#fffefa",
    color: "#34372f",
    resize: "vertical",
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
      <p
        style={{
          color: "#153cbd",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        STARTUPSHIELD · GEMINI MARKET RESEARCH
      </p>

      <h1
        style={{
          fontFamily: "Georgia, serif",
          fontWeight: 400,
          fontSize: "clamp(40px, 6vw, 68px)",
          lineHeight: 1.1,
        }}
      >
        A clearer view of your market.
      </h1>

      <p style={{ fontSize: 18, lineHeight: 1.7 }}>
        Research competitors, examine demand evidence,
        and identify your next validation test.
      </p>

      <p
        style={{
          color: "#72766b",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        Your description is sent to Google. Public searches
        may use parts of it. Do not include customer
        identities or confidential information.
      </p>

      <form
        onSubmit={research}
        style={{
          display: "grid",
          gap: 22,
          marginTop: 30,
        }}
      >
        {fields.map(([key, label, maximum]) => (
          <label
            key={key}
            style={{
              display: "grid",
              gap: 9,
              fontSize: 15,
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
                  ? 4
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

        <button
          disabled={busy}
          type="submit"
          style={{
            padding: "16px 25px",
            border: 0,
            borderRadius: 30,
            background: "#153cbd",
            color: "white",
            fontSize: 16,
            opacity: busy ? 0.7 : 1,
            cursor: busy ? "wait" : "pointer",
          }}
        >
          {busy
            ? "Researching current sources…"
            : "Research my market with Gemini ↗"}
        </button>
      </form>

      {busy && (
        <p
          role="status"
          style={{
            color: "#72766b",
            fontSize: 13,
          }}
        >
          Searching and preparing your report.
          This may take several seconds.
        </p>
      )}

      {error && (
        <p
          role="alert"
          style={{
            padding: 18,
            marginTop: 25,
            background: "#faeeee",
            border: "1px solid #e7c8c8",
            borderRadius: 9,
            lineHeight: 1.7,
          }}
        >
          {error}
        </p>
      )}

      {result && (
        <section
          aria-label="Market research results"
          style={{ marginTop: 40 }}
        >
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 400,
              fontSize: 36,
            }}
          >
            Your market brief.
          </h2>

          <p
            style={{
              fontSize: 12,
              color: "#72766b",
              lineHeight: 1.7,
            }}
          >
            Research completed:{" "}
            {new Date(
              result.researchedAt
            ).toLocaleString()}.
            {" "}
            This is a search-backed interpretation,
            not proof of demand. Verify source dates
            and claims.
          </p>

          <div
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              lineHeight: 1.8,
              padding: 25,
              background: "#f0f2fa",
              border: "1px solid #dce2f3",
              borderRadius: 12,
            }}
          >
            {result.report}
          </div>

          <h3 style={{ marginTop: 30 }}>
            Sources returned by Google Search
          </h3>

          <ol style={{ paddingLeft: 25 }}>
            {result.sources.map((source) => (
              <li
                key={source.id}
                value={source.id}
                style={{
                  margin: "12px 0",
                  overflowWrap: "anywhere",
                }}
              >
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#153cbd" }}
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

          <p style={{ marginTop: 25 }}>
            <a
              href="/diagnostics"
              style={{ color: "#153cbd" }}
            >
              Check your conversion and retention metrics ↗
            </a>
          </p>
        </section>
      )}
    </main>
  );
}
