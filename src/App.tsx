function App() {
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
