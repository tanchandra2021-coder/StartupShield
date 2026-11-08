import Dashboard from "./Dashboard";
import GeminiMarketPage from "./market/page";

export default function HomePage() {
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
        <a
          href="#financial-dashboard"
          style={{
            padding: "11px 20px",
            border: "1px solid #d5d8cc",
            borderRadius: "30px",
            color: "#34372f",
            textDecoration: "none",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
          }}
        >
          Financial dashboard
        </a>

        <a
          href="#gemini-market-research"
          style={{
            padding: "11px 20px",
            borderRadius: "30px",
            background: "#153cbd",
            color: "#ffffff",
            textDecoration: "none",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
          }}
        >
          Research my market with Gemini ↗
        </a>

        <a
          href="/diagnostics"
          style={{
            padding: "11px 20px",
            border: "1px solid #d5d8cc",
            borderRadius: "30px",
            color: "#34372f",
            textDecoration: "none",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
          }}
        >
          Demand and retention
        </a>
      </nav>

      <div
        id="financial-dashboard"
        style={{ scrollMarginTop: "100px" }}
      >
        <Dashboard />
      </div>

      <section
        id="gemini-market-research"
        aria-label="Gemini market research"
        style={{
          scrollMarginTop: "100px",
          paddingTop: "35px",
          paddingBottom: "50px",
          borderTop: "1px solid #deded5",
          background: "#f8f7f3",
        }}
      >
        <GeminiMarketPage />
      </section>
    </>
  );
}
