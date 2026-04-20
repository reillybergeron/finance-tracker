import React, { useEffect, useState } from "react";
import axios from "axios";

import { apiUrl } from "../apiConfig";

const money = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async (pageNum) => {
    try {
      setLoading(true);

      const response = await axios.get(
        apiUrl(`/api/transactions?page=${pageNum}&size=50`),
      );

      setTransactions(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(apiUrl(`/api/transactions/${id}`));
      fetchTransactions(page);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  const totals = (transactions || []).reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Transactions</h1>
        <p className="page__subtitle">
          Browse and manage entries. Totals below are for this page only.
        </p>
      </header>

      {loading && <p className="loading">Loading…</p>}

      {!loading && transactions.length === 0 && (
        <p className="empty">No transactions found.</p>
      )}

      {!loading && transactions.length > 0 && (
        <ul className="txn-list" aria-label="Transaction list">
          {transactions.map((t) => (
            <li key={t.id} className="txn-row">
              <div className="txn-row__info">
                <span className="txn-row__date">{t.date}</span>
                <span className="txn-row__cat">{t.category}</span>
                <span className="txn-row__amount">{money(t.amount)}</span>
                <span className="txn-row__desc">{t.description}</span>
              </div>
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() => deleteTransaction(t.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="pagination">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
        >
          Previous
        </button>
        <span className="pagination__meta">
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
        </span>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() =>
            setPage((p) => (p < totalPages - 1 ? p + 1 : p))
          }
          disabled={page >= totalPages - 1}
        >
          Next
        </button>
      </div>

      {Object.keys(totals).length > 0 && (
        <section className="panel" aria-labelledby="page-totals-heading">
          <h2 id="page-totals-heading" className="panel__title">
            Page totals
          </h2>
          <ul className="totals-list">
            {Object.keys(totals).map((cat) => (
              <li key={cat}>
                <span>{cat}</span>
                <span>{money(totals[cat])}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default TransactionList;
