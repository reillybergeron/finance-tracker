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
      const response = await axios.post(
        apiUrl("/api/transactions"),
        {
          category,
          amount: parseFloat(amount),
          date,
          description,
        },
      );
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
    <div>
      <h2>Add Transaction</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
      >
        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default AddTransaction;
