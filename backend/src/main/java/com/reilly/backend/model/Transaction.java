package com.reilly.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(
        name = "transactions",
        indexes = {
            @Index(name = "idx_transactions_date", columnList = "date"),
            @Index(name = "idx_transactions_category", columnList = "category")
        })
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;
    private Double amount;
    private LocalDate date;
    private String description;

    // Default constructor required by JPA
    public Transaction() {}

    // Constructor for convenience
    public Transaction(String category, Double amount, LocalDate date, String description) {
        this.category = category;
        this.amount = amount;
        this.date = date;
        this.description = description;
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
