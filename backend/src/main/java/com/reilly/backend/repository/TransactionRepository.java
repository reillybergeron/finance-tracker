package com.reilly.backend.repository;

import com.reilly.backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM transactions", nativeQuery = true)
    BigDecimal sumTotalAmount();

    @Query(
            value =
                    "SELECT COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized'), COALESCE(SUM(amount), 0) "
                            + "FROM transactions GROUP BY 1",
            nativeQuery = true)
    List<Object[]> sumAmountByCategory();

    @Query(
            value =
                    "SELECT COALESCE(TO_CHAR(date, 'YYYY-MM'), '0000-00'), COALESCE(SUM(amount), 0) "
                            + "FROM transactions GROUP BY 1 ORDER BY 1",
            nativeQuery = true)
    List<Object[]> sumAmountByMonth();

    @Query(
            value =
                    "SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE date >= :from AND date <= :to",
            nativeQuery = true)
    BigDecimal sumTotalAmountBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query(
            value =
                    "SELECT COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized'), COALESCE(SUM(amount), 0) "
                            + "FROM transactions WHERE date >= :from AND date <= :to GROUP BY 1",
            nativeQuery = true)
    List<Object[]> sumAmountByCategoryBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query(
            value =
                    "SELECT COALESCE(TO_CHAR(date, 'YYYY-MM'), '0000-00'), COALESCE(SUM(amount), 0) "
                            + "FROM transactions WHERE date >= :from AND date <= :to GROUP BY 1 ORDER BY 1",
            nativeQuery = true)
    List<Object[]> sumAmountByMonthBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query(
            value = "SELECT COUNT(*) FROM transactions WHERE date >= :from AND date <= :to",
            nativeQuery = true)
    long countBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

}
