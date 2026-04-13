import React, { useEffect, useState } from "react";
import axios from "axios";

import { apiUrl } from "../apiConfig";

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async (pageNum) => {
    try {
      setLoading(true);

      const response = await axios.get(
        apiUrl(`/api/transactions?page=${pageNum}&size=50`)
      );

      //handling
      setTransactions(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);

    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(apiUrl(`/api/transactions/${id}`));
      fetchTransactions(page); // refresh page
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  //reduce
  const totals = (transactions || []).reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Transactions</h2>

      {/*LOADING STATE */}
      {loading && <p>Loading transactions...</p>}

      {/*EMPTY STATE */}
      {!loading && transactions.length === 0 && (
        <p>No transactions found.</p>
      )}

      {/* LIST */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {transactions.map((t) => (
          <li
            key={t.id}
            style={{
              marginBottom: "8px",
              borderBottom: "1px solid #334155",
              paddingBottom: "6px",
            }}
          >
            <strong>{t.date}</strong> — {t.category} — $
            {t.amount.toFixed(2)} — {t.description}

            <button
              onClick={() => deleteTransaction(t.id)}
              style={{
                marginLeft: "10px",
                color: "white",
                backgroundColor: "#ef4444",
                border: "none",
                padding: "4px 8px",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* PAGINATION */}
      <div style={{ marginTop: "15px", display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
        >
          Prev
        </button>

        <span>
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
        </span>

        <button
          onClick={() =>
            setPage((p) => (p < totalPages - 1 ? p + 1 : p))
          }
          disabled={page >= totalPages - 1}
        >
          Next
        </button>
      </div>

      {/* TOTALS */}
      <h3 style={{ marginTop: "20px" }}>Totals (Current Page)</h3>
      <ul>
        {Object.keys(totals).map((cat) => (
          <li key={cat}>
            {cat}: ${totals[cat].toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;
