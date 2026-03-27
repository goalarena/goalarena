function App() {
const btn = (color: string) => ({
  background: color,
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold"
});
  return (
    <div>
      {/* Navbar */}
      <nav style={{
        background: "#0f172a",
        color: "white",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2 style={{ color: "#22c55e" }}>⚽ GoalArena</h2>

        <div style={{ display: "flex", gap: "20px" }}>
          <span>Live</span>
          <span>News</span>
          <span>Transfers</span>
          <span>Highlights</span>
          <span>Leagues</span>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "60px",
        background: "#020617",
        color: "white"
      }}>
        <h1 style={{ fontSize: "40px" }}>
          Live Football Scores, Fixtures & Results
        </h1>
        <p style={{ marginTop: "10px", opacity: 0.7 }}>
          Stay up-to-date with real-time scores and news
        </p>
      </div>
    </div>
  );
}

export default App;
<div style={{
  display: "flex",
  justifyContent: "center",
  gap: "15px",
  marginTop: "20px",
  flexWrap: "wrap"
}}>
  <button style={btn("#22c55e")}>⚡ Live</button>
  <button style={btn("#3b82f6")}>📰 News</button>
  <button style={btn("#a855f7")}>🔄 Transfers</button>
  <button style={btn("#f97316")}>▶ Highlights</button>
  <button style={btn("#eab308")}>🏆 Leagues</button>
</div>
