import React, { useState } from "react";
import axios from "axios";

import { apiUrl } from "../apiConfig";

function AddTransaction({ onAdd }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(apiUrl("/api/transactions"), {
        category,
        amount: parseFloat(amount),
        date,
        description,
      });
      onAdd(response.data);
      setCategory("");
      setAmount("");
      setDate("");
      setDescription("");
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Add transaction</h1>
        <p className="page__subtitle">Record a new entry to your ledger.</p>
      </header>

      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          aria-label="Category"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          aria-label="Amount"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          aria-label="Date"
        />
        <input
          className="field--wide"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="Description"
        />
        <button type="submit" className="btn btn--primary">
          Add
        </button>
      </form>
    </div>
  );
}

export default AddTransaction;
