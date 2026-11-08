import Dashboard from "./Dashboard";

export default function HomePage() {
  const linkStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 22px",
    border: "1px solid #d5d8cc",
    borderRadius: "30px",
    color: "#34372f",
    textDecoration: "none",
    fontSize: "14px",
  };

  return (
    <>
      <nav
        aria-label="StartupShield navigation"
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
        <a href="#financial-dashboard" style={linkStyle}>
          Financial dashboard
        </a>

        <a
          href="/diagnostics"
          style={{
            ...linkStyle,
            background: "#153cbd",
            borderColor: "#153cbd",
            color: "#ffffff",
          }}
        >
          Research my market ↗
        </a>

        <a href="/about" style={linkStyle}>
          About StartupShield
        </a>
      </nav>

      <div
        id="financial-dashboard"
        style={{
          scrollMarginTop: "130px",
          background: "#f8f7f3",
          minHeight: "100vh",
        }}
      >
        <Dashboard />
      </div>

      <footer
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px",
          padding: "28px 20px",
          background: "#f8f7f3",
          borderTop: "1px solid #deded5",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
        }}
      >
        <a
          href="/about"
          style={{
            color: "#34372f",
            textDecoration: "none",
          }}
        >
          About StartupShield
        </a>

        <a
          href="/diagnostics"
          style={{
            color: "#153cbd",
            textDecoration: "none",
          }}
        >
          Run my business checkup ↗
        </a>
      </footer>
    </>
  );
}
