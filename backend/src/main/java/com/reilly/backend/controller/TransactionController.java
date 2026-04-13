package com.reilly.backend.controller;

import com.reilly.backend.model.Transaction;
import com.reilly.backend.repository.TransactionRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import java.util.*;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @GetMapping("/reports/summary")
    public Map<String, Object> getSummary() {

        List<Transaction> transactions = transactionRepository.findAll();

        Map<String, Double> categoryTotals = new HashMap<>();
        Map<String, Double> monthlyTotals = new HashMap<>();

        double totalSpent = 0;

        for (Transaction t : transactions) {

            double amount = t.getAmount();
            totalSpent += amount;

            // Category totals
            categoryTotals.put(
                    t.getCategory(),
                    categoryTotals.getOrDefault(t.getCategory(), 0.0) + amount);

            // Monthly totals (YYYY-MM)
            String month = t.getDate().toString().substring(0, 7);

            monthlyTotals.put(
                    month,
                    monthlyTotals.getOrDefault(month, 0.0) + amount);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalSpent", totalSpent);
        result.put("categoryTotals", categoryTotals);
        result.put("monthlyTotals", monthlyTotals);
        result.put("totalTransactions", transactions.size());

        return result;
    }

    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // ✅ PAGINATED GET
    @GetMapping
    public Page<Transaction> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return transactionRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date")));
    }

    // POST
    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    // GET by ID
    @GetMapping("/{id}")
    public Transaction getTransactionById(@PathVariable Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id " + id));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        transactionRepository.deleteById(id);
    }

}
