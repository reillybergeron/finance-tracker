import React, { useState } from "react";
import axios from "axios";

import { apiUrl } from "../apiConfig";

function todayLocalISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function validateClient(category, amount, date, description) {
  const cat = category.trim();
  if (!cat) {
    return "Category is required.";
  }
  if (cat.length > 100) {
    return "Category must be 100 characters or less.";
  }
  const amt = parseFloat(amount, 10);
  if (Number.isNaN(amt) || amt <= 0) {
    return "Amount must be a number greater than zero.";
  }
  if (!date) {
    return "Date is required.";
  }
  if (date > todayLocalISODate()) {
    return "Date cannot be in the future.";
  }
  if (description.trim().length > 500) {
    return "Description must be 500 characters or less.";
  }
  return "";
}

function AddTransaction({ onAdd }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const clientMsg = validateClient(category, amount, date, description);
    if (clientMsg) {
      setFormError(clientMsg);
      return;
    }

    try {
      const response = await axios.post(apiUrl("/api/transactions"), {
        category: category.trim(),
        amount: parseFloat(amount, 10),
        date,
        description: description.trim() || null,
      });
      onAdd(response.data);
      setCategory("");
      setAmount("");
      setDate("");
      setDescription("");
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.errors) {
        const list = error.response.data.errors;
        setFormError(
          Array.isArray(list) ? list.join(" ") : String(list),
        );
      } else if (error.response?.data?.message) {
        setFormError(String(error.response.data.message));
      } else {
        setFormError("Could not save. Check your connection and try again.");
      }
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Add transaction</h1>
        <p className="page__subtitle">Record a new entry to your ledger.</p>
      </header>

      {formError ? (
        <p className="form-error" role="alert">
          {formError}
        </p>
      ) : null}

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          maxLength={100}
          aria-label="Category"
        />
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label="Amount"
        />
        <input
          type="date"
          max={todayLocalISODate()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Date"
        />
        <input
          className="field--wide"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
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
