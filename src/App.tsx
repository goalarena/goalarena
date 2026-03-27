[18:57, 27.03.2026] Ahmed Emin: <div
  style={{
    textAlign: "center",
    padding: "80px 20px",
    backgroundImage:
      "linear-gradient(rgba(2,6,23,0.65), rgba(2,6,23,0.75)), url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "white"
  }}
>
  <h1 style={{ fontSize: "52px", marginBottom: "10px" }}>
    Live Football Scores, Fixtures & Results
  </h1>

  <p style={{ marginTop: "10px", opacity: 0.9, fontSize: "18px" }}>
    Stay up-to-date with real-time scores, fixtures, results, and the latest football news
  </p>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      marginTop: "25px",
      flexWrap: "wrap"
    }…
[19:01, 27.03.2026] Ahmed Emin: import React from "react";

export default function App() {

  const btn = (color: string) => ({
    background: color,
    border: "none",
    borderRadius: "999px",
    padding: "10px 18px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  });

  const cardStyle = {
    background: "linear-gradient(180deg, #1e293b, #0f172a)",
    color: "white",
    borderRadius: "20px",
    padding: "20px",
    minWidth: "260px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)"
  };

  return (
    <div style={{ fontFamily: "sans-serif", background: "#f1f5f9" }}>

      {/* Navbar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "20px",
        background: "#0f172a",
        color: "white"
      }}>
        <h2 style={{ color: "#22c55e" }}>GoalArena</h2>

        <div style={{ display: "flex", gap: "20px" }}>
          <span>Live</span>
          <span>News</span>
          <span>Transfers</span>
          <span>Highlights</span>
          <span>Leagues</span>
        </div>
      </div>

      {/* Hero Section */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          backgroundImage:
            "linear-gradient(rgba(2,6,23,0.7), rgba(2,6,23,0.8)), url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white"
        }}
      >
        <h1 style={{ fontSize: "50px" }}>
          Live Football Scores, Fixtures & Results
        </h1>

        <p style={{ marginTop: "10px", opacity: 0.9 }}>
          Stay up-to-date with real-time scores and news
        </p>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          marginTop: "25px",
          flexWrap: "wrap"
        }}>
          <button style={btn("#22c55e")}>⚡ Live</button>
          <button style={btn("#3b82f6")}>📰 News</button>
          <button style={btn("#a855f7")}>🔄 Transfers</button>
          <button style={btn("#f97316")}>▶ Highlights</button>
          <button style={btn("#eab308")}>🏆 Leagues</button>
        </div>
      </div>

      {/* Live Matches */}
      <div style={{ padding: "40px 20px" }}>
        <h2 style={{ marginBottom: "20px" }}>🔴 Live Matches</h2>

        <div style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap"
        }}>

          <div style={cardStyle}>
            <p>Friendlies</p>
            <h3>Tunisia U20</h3>
            <h3>Mauritania U20</h3>
            <strong>3 - 2</strong>
          </div>

          <div style={cardStyle}>
            <p>Friendlies</p>
            <h3>Kyrgyz Republic U23</h3>
            <h3>Jordan U23</h3>
            <strong>1 - 2</strong>
          </div>

          <div style={cardStyle}>
            <p>Friendlies</p>
            <h3>USA U20</h3>
            <h3>Mexico U20</h3>
            <strong>0 - 0</strong>
          </div>

        </div>
      </div>

    </div>
  );
}
