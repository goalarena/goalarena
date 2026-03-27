export default function App() {
  const matches = [
    { league: "Friendlies", home: "Tunisia U20", away: "Mauritania U20", hs: 3, as: 2, minute: "89'", live: true },
    { league: "Friendlies", home: "Kyrgyz Republic U23", away: "Jordan U23", hs: 1, as: 2, minute: "90'", live: true },
    { league: "Friendlies", home: "United States U20", away: "Mexico U20", hs: 0, as: 0, minute: "32'", live: true },
  ];

  return (
    <div style={{ background: "#050b1a", minHeight: "100vh", color: "white", fontFamily: "Arial, sans-serif" }}>
      <header
        style={{
          display: "flex",
          gap: 24,
          alignItems: "center",
          padding: "18px 28px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky",
          top: 0,
          background: "#071022",
          zIndex: 10,
        }}
      >
        <div style={{ color: "#39e58c", fontWeight: 700, fontSize: 24 }}>GoalArena</div>
        <nav style={{ display: "flex", gap: 18, fontSize: 15, color: "#c9d3e3" }}>
          <span>Live</span>
          <span>News</span>
          <span>Transfers</span>
          <span>Highlights</span>
          <span>Leagues</span>
        </nav>
      </header>

      <section
        style={{
          padding: "56px 28px 36px",
          background:
            "linear-gradient(rgba(4,10,24,0.45), rgba(4,10,24,0.9)), url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80') center/cover",
        }}
      >
        <div style={{ maxWidth: 900 }}>
          <div style={{ color: "#7dffb3", fontWeight: 700, marginBottom: 12 }}>GoalArena</div>
          <h1 style={{ fontSize: 58, lineHeight: 1.05, margin: 0, fontWeight: 800 }}>
            Live Football Scores,
            <br />
            Fixtures & Results
          </h1>
          <p style={{ color: "#d3d9e7", fontSize: 20, maxWidth: 760, marginTop: 20 }}>
            Stay up-to-date with real-time scores, fixtures, results, and the latest football news from top leagues worldwide.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 28 }}>
            {[
              ["Live", "#31d67b"],
              ["News", "#3aa8ff"],
              ["Transfers", "#a565ff"],
              ["Highlights", "#ff8a3d"],
              ["Leagues", "#f3c623"],
            ].map(([label, color]) => (
              <button
                key={label}
                style={{
                  background: color,
                  color: "white",
                  border: "none",
                  borderRadius: 999,
                  padding: "14px 24px",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 34 }}>Live Matches</h2>
          <span style={{ color: "#39e58c", fontWeight: 700 }}>View All</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {matches.map((m, i) => (
            <div
              key={i}
              style={{
                background: "linear-gradient(180deg, #0d1630, #0a1225)",
                border: "1px solid rgba(255,80,120,0.25)",
                borderRadius: 24,
                padding: 20,
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, color: "#c6d0e2" }}>
                <span>{m.league}</span>
                <span style={{ color: "#ff657e", fontWeight: 700 }}>{m.live ? "LIVE" : m.minute}</span>
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 700 }}>
                  <span>{m.home}</span>
                  <span>{m.hs}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 700 }}>
                  <span>{m.away}</span>
                  <span>{m.as}</span>
                </div>
              </div>

              <div style={{ marginTop: 18, color: "#9fb0c8" }}>{m.minute}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
