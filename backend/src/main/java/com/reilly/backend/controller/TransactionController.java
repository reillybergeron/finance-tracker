package com.reilly.backend.controller;

import com.reilly.backend.dto.CreateTransactionRequest;
import com.reilly.backend.model.Transaction;
import com.reilly.backend.reporting.FinancialReportingService;
import com.reilly.backend.repository.TransactionRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @GetMapping("/reports/summary")
    public Map<String, Object> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return financialReportingService.buildFullReport(from, to);
    }

    private final TransactionRepository transactionRepository;
    private final FinancialReportingService financialReportingService;

    public TransactionController(
            TransactionRepository transactionRepository,
            FinancialReportingService financialReportingService) {
        this.transactionRepository = transactionRepository;
        this.financialReportingService = financialReportingService;
    }

    //PAGINATED GET
    @GetMapping
    public Page<Transaction> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return transactionRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date")));
    }

    // POST
    @PostMapping
    public Transaction createTransaction(@Valid @RequestBody CreateTransactionRequest body) {
        String desc = body.description();
        if (desc != null) {
            desc = desc.trim();
            if (desc.isEmpty()) {
                desc = null;
            }
        }
        Transaction entity = new Transaction(
                body.category().trim(),
                body.amount(),
                body.date(),
                desc);
        return transactionRepository.save(entity);
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
