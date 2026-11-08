import Dashboard from "./Dashboard";

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
          fontFamily: "Arial, sans-serif",
        }}
      >
        <a
          href="#financial-dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 22px",
            border: "1px solid #d5d8cc",
            borderRadius: "30px",
            color: "#34372f",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          Financial dashboard
        </a>

        <a
          href="/diagnostics"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 22px",
            border: "1px solid #153cbd",
            borderRadius: "30px",
            background: "#153cbd",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          Research my market ↗
        </a>
      </nav>

      <main
        id="financial-dashboard"
        style={{
          scrollMarginTop: "110px",
          background: "#f8f7f3",
        }}
      >
        <Dashboard />
      </main>
    </>
  );
}
