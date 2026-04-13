package com.reilly.backend;

import com.reilly.backend.model.Transaction;
import com.reilly.backend.repository.TransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    private final TransactionRepository repo;

    public DataSeeder(TransactionRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {

        //prevent duplicate seeding
        if (repo.count() > 0) {
            System.out.println("Database already seeded. Skipping...");
            return;
        }

        System.out.println("Seeding 100,000 transactions...");

        Random random = new Random();

        String[] categories = {
                "Food", "Clothes", "Utilities", "Travel", "Entertainment", "Other"
        };

        String[] descriptions = {
                "Auto-generated transaction",
                "Recurring charge",
                "One-time purchase",
                "Service payment"
        };

        LocalDate startDate = LocalDate.now().minusYears(5);

        List<Transaction> batch = new ArrayList<>();

        int total = 200_000;

        for (int i = 0; i < total; i++) {

            String category = categories[random.nextInt(categories.length)];
            String description = descriptions[random.nextInt(descriptions.length)];

            Transaction t = new Transaction(
                    category,
                    5 + random.nextDouble() * 10,
                    startDate.plusDays(random.nextInt(365 * 5)),
                    description
            );

            batch.add(t);

            //batch insert
            if (batch.size() == 1000) {
                repo.saveAll(batch);
                batch.clear();
            }
        }

        repo.saveAll(batch);

        System.out.println("Seeding complete: " + total + " transactions inserted.");
    }
}
