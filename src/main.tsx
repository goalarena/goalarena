import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>⚽ GoalArena</h1>
      <p>Live football scores coming soon...</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
