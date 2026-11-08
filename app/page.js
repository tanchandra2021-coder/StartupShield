import Dashboard from "./Dashboard";
import CheckupPage from "./market/page";

export default function HomePage() {
  const linkStyle = {
    padding: "11px 20px",
    border: "1px solid #d5d8cc",
    borderRadius: "30px",
    color: "#34372f",
    textDecoration: "none",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
  };

  return (
    <>
      <nav
        aria-label="StartupShield tools"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "16px 20px",
          background: "#f8f7f3",
          borderBottom: "1px solid #deded5",
        }}
      >
        <a href="#financial-dashboard" style={linkStyle}>
          Financial dashboard
        </a>

        <a
          href="#five-risk-checkup"
          style={{
            ...linkStyle,
            background: "#153cbd",
            borderColor: "#153cbd",
            color: "#ffffff",
          }}
        >
          Run my five-risk checkup ↗
        </a>

        <a href="/diagnostics" style={linkStyle}>
          Demand and retention
        </a>
      </nav>

      <div
        id="financial-dashboard"
        style={{ scrollMarginTop: "110px" }}
      >
        <Dashboard />
      </div>

      {/* Preserve existing dashboard links to the old Gemini section. */}
      <div
        id="gemini-market-research"
        style={{ scrollMarginTop: "110px" }}
      >
        <section
          id="five-risk-checkup"
          aria-label="Five-risk business checkup"
          style={{
            scrollMarginTop: "110px",
            borderTop: "1px solid #deded5",
            background: "#f8f7f3",
          }}
        >
          <CheckupPage />
        </section>
      </div>
    </>
  );
}
