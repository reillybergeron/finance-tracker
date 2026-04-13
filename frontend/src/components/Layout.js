import React from "react";

function Layout({ children, setPage }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <div style={{
        width: "220px",
        backgroundColor: "#020617",
        padding: "20px",
        borderRight: "1px solid #1e293b"
      }}>
        <h2 style={{ color: "#3b82f6" }}>Finance Tracker</h2>

        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={() => setPage("dashboard")}>Dashboard</button>
          <button onClick={() => setPage("transactions")}>Transactions</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        padding: "20px",
        overflowY: "auto"
      }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
