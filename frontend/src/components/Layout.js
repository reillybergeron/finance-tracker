import React from "react";

function Layout({ children, setPage, currentPage }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">Finance</div>
        <nav className="sidebar__nav" aria-label="Main">
          <button
            type="button"
            className={`nav-item${currentPage === "dashboard" ? " nav-item--active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`nav-item${currentPage === "transactions" ? " nav-item--active" : ""}`}
            onClick={() => setPage("transactions")}
          >
            Transactions
          </button>
        </nav>
      </aside>

      <main className="main">
        <div className="main__inner">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
