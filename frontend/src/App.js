import React, { useState, useEffect } from "react";
import axios from "axios";

import { apiUrl } from "./apiConfig";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import TransactionList from "./components/TransactionList";
import AddTransaction from "./components/AddTransaction";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [updateFlag, setUpdateFlag] = useState(false);
  const [page, setPage] = useState("dashboard");

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(apiUrl("/api/transactions"));
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [updateFlag]);

  const handleAdd = () => {
    setUpdateFlag(!updateFlag);
  };

  return (
    <Layout setPage={setPage} currentPage={page}>
      {/* 📊 Dashboard Page */}
      {page === "dashboard" && (
        <>
          <div className="card">
            <Dashboard
              transactions={transactions}
            />
          </div>
        </>
      )}

      {/* 💳 Transactions Page */}
      {page === "transactions" && (
        <>
          <div className="card">
            <AddTransaction onAdd={handleAdd} />
          </div>

          <div className="card">
            <TransactionList key={updateFlag} />
          </div>
        </>
      )}
    </Layout>
  );
}

export default App;
