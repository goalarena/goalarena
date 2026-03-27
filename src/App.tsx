const btn = (color: string) => ({
  background: color,
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold"
});

const cardStyle = {
  background: "#0f172a",
  color: "white",
  borderRadius: "20px",
  padding: "20px",
  minWidth: "260px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  border: "1px solid rgba(255,255,255,0.08)"
} as const;

function App() {
  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <nav
        style={{
          background: "#0f172a",
          color: "white",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h2 style={{ color: "#22c55e", margin: 0 }}>⚽ GoalArena</h2>

        <div style={{ display: "flex", gap: "20px" }}>
          <span>Live</span>
          <span>News</span>
          <span>Transfers</span>
          <span>Highlights</span>
          <span>Leagues</span>
        </div>
      </nav>

      <div
        style={{
          textAlign: "center",
          padding: "60px",
          background: "#020617",
          color: "white"
        }}
      >
        <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
          Live Football Scores, Fixtures & Results
        </h1>

        <p style={{ marginTop: "10px", opacity: 0.7 }}>
          Stay up-to-date with real-time scores and news
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginTop: "20px",
            flexWrap: "wrap"
          }}
        >
          <button style={btn("#22c55e")}>⚡ Live</button>
          <button style={btn("#3b82f6")}>📰 News</button>
          <button style={btn("#a855f7")}>🔄 Transfers</button>
          <button style={btn("#f97316")}>▶ Highlights</button>
          <button style={btn("#eab308")}>🏆 Leagues</button>
        </div>
      </div>

      <div style={{ padding: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}
        >
          <h2 style={{ margin: 0, color: "#0f172a" }}>🔴 Live Matches</h2>
          <span style={{ color: "#10b981", fontWeight: "bold" }}>View All</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px"
          }}
        >
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", opacity: 0.8 }}>
              <span>Friendlies</span>
              <span style={{ color: "#ef4444", fontWeight: "bold" }}>LIVE 89'</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "20px" }}>
              <span>Tunisia U20</span>
              <strong>3</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px" }}>
              <span>Mauritania U20</span>
              <strong>2</strong>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", opacity: 0.8 }}>
              <span>Friendlies</span>
              <span style={{ color: "#ef4444", fontWeight: "bold" }}>LIVE 90'</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "20px" }}>
              <span>Kyrgyz Republic U23</span>
              <strong>1</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px" }}>
              <span>Jordan U23</span>
              <strong>2</strong>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", opacity: 0.8 }}>
              <span>Friendlies</span>
              <span style={{ color: "#ef4444", fontWeight: "bold" }}>LIVE 32'</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "20px" }}>
              <span>United States U20</span>
              <strong>0</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px" }}>
              <span>Mexico U20</span>
              <strong>0</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
