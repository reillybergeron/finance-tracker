package com.reilly.backend.repository;

import com.reilly.backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // JpaRepository gives us all CRUD methods automatically:
    // save(), findAll(), findById(), deleteById(), etc.
}
