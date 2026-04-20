package com.reilly.backend.reporting;

import com.reilly.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Centralizes multi-dimensional aggregation, derived KPI math, and named
 * business-rule evaluation used by financial reporting outputs.
 *
 * <p>Rollups are loaded from PostgreSQL aggregate queries (not full-table ORM
 * scans) when building dashboard summaries.
 */
@Service
public class FinancialReportingService {

    private static final double EPS = 0.02;
    /** Category is flagged when it exceeds this share of lifetime spend. */
    private static final double CATEGORY_CONCENTRATION_THRESHOLD = 0.40;
    /** Month-over-month total spend change magnitude that triggers velocity monitoring. */
    private static final double MOM_VELOCITY_THRESHOLD_PERCENT = 25.0;
    /** Current month vs trailing-12 average triggers budget-pressure signal. */
    private static final double BUDGET_PRESSURE_RATIO = 1.20;

    private final TransactionRepository transactionRepository;

    public FinancialReportingService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    /**
     * @param from inclusive lower date bound, or null for open start
     * @param to inclusive upper date bound, or null for open end
     */
    public Map<String, Object> buildFullReport(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new IllegalArgumentException("'from' must be on or before 'to'");
        }

        Map<String, Double> categoryTotals = new LinkedHashMap<>();
        Map<String, Double> monthlyTotals = new TreeMap<>();
        double totalSpent;
        long count;

        if (from == null && to == null) {
            totalSpent = toDouble(transactionRepository.sumTotalAmount());
            for (Object[] row : transactionRepository.sumAmountByCategory()) {
                categoryTotals.put(String.valueOf(row[0]), toDouble(row[1]));
            }
            for (Object[] row : transactionRepository.sumAmountByMonth()) {
                monthlyTotals.put(String.valueOf(row[0]), toDouble(row[1]));
            }
            count = transactionRepository.count();
        } else {
            LocalDate f = from != null ? from : LocalDate.of(1970, 1, 1);
            LocalDate t = to != null ? to : LocalDate.of(9999, 12, 31);
            totalSpent = toDouble(transactionRepository.sumTotalAmountBetween(f, t));
            for (Object[] row : transactionRepository.sumAmountByCategoryBetween(f, t)) {
                categoryTotals.put(String.valueOf(row[0]), toDouble(row[1]));
            }
            for (Object[] row : transactionRepository.sumAmountByMonthBetween(f, t)) {
                monthlyTotals.put(String.valueOf(row[0]), toDouble(row[1]));
            }
            count = transactionRepository.countBetween(f, t);
        }

        Map<String, Object> kpis = computeKpis(categoryTotals, monthlyTotals, totalSpent);
        List<Map<String, Object>> businessRules =
                evaluateBusinessRules(categoryTotals, monthlyTotals, totalSpent, count, kpis);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalSpent", totalSpent);
        result.put("categoryTotals", categoryTotals);
        result.put("monthlyTotals", monthlyTotals);
        result.put("totalTransactions", count);
        result.put("kpis", kpis);
        result.put("businessRules", businessRules);
        return result;
    }

    private static double toDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        if (value instanceof Number n) {
            return n.doubleValue();
        }
        return Double.parseDouble(value.toString());
    }

    private Map<String, Object> computeKpis(
            Map<String, Double> categoryTotals,
            Map<String, Double> monthlyTotals,
            double totalSpent) {

        List<String> months = new ArrayList<>(monthlyTotals.keySet());
        months.sort(Comparator.naturalOrder());

        Double momPct = null;
        Double yoyPct = null;
        if (months.size() >= 2) {
            String curM = months.get(months.size() - 1);
            String prevM = months.get(months.size() - 2);
            double cur = monthlyTotals.getOrDefault(curM, 0.0);
            double prev = monthlyTotals.getOrDefault(prevM, 0.0);
            if (prev > EPS) {
                momPct = (cur - prev) / prev * 100.0;
            }
        }

        Map<String, Double> yearlyTotals = new LinkedHashMap<>();
        for (Map.Entry<String, Double> e : monthlyTotals.entrySet()) {
            String year = e.getKey().substring(0, 4);
            yearlyTotals.merge(year, e.getValue(), Double::sum);
        }
        List<String> years = new ArrayList<>(yearlyTotals.keySet());
        years.sort(Comparator.naturalOrder());
        if (years.size() >= 2) {
            String curY = years.get(years.size() - 1);
            String prevY = years.get(years.size() - 2);
            double cur = yearlyTotals.getOrDefault(curY, 0.0);
            double py = yearlyTotals.getOrDefault(prevY, 0.0);
            if (py > EPS) {
                yoyPct = (cur - py) / py * 100.0;
            }
        }

        Double trailing3Avg = null;
        if (months.size() >= 3) {
            double s = 0;
            for (int i = months.size() - 3; i < months.size(); i++) {
                s += monthlyTotals.getOrDefault(months.get(i), 0.0);
            }
            trailing3Avg = s / 3.0;
        }

        Double trailing12Avg = null;
        if (!months.isEmpty()) {
            int n = Math.min(12, months.size());
            double s = 0;
            for (int i = months.size() - n; i < months.size(); i++) {
                s += monthlyTotals.getOrDefault(months.get(i), 0.0);
            }
            trailing12Avg = s / n;
        }

        Map<String, Double> categorySharePercent = new LinkedHashMap<>();
        if (totalSpent > EPS) {
            for (Map.Entry<String, Double> e : categoryTotals.entrySet()) {
                categorySharePercent.put(e.getKey(), e.getValue() / totalSpent * 100.0);
            }
        }

        double avgMonthly =
                months.isEmpty() ? 0.0 : monthlyTotals.values().stream().mapToDouble(Double::doubleValue).sum() / months.size();
        double avgYearly =
                years.isEmpty()
                        ? 0.0
                        : yearlyTotals.values().stream().mapToDouble(Double::doubleValue).sum()
                                / years.size();

        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("monthOverMonthChangePercent", momPct);
        kpis.put("yearOverYearChangePercent", yoyPct);
        kpis.put("trailingThreeMonthAverage", trailing3Avg);
        kpis.put("trailingTwelveMonthAverage", trailing12Avg);
        kpis.put("averageMonthlySpend", avgMonthly);
        kpis.put("averageYearlySpend", avgYearly);
        kpis.put("categorySharePercent", categorySharePercent);
        return kpis;
    }

    private List<Map<String, Object>> evaluateBusinessRules(
            Map<String, Double> categoryTotals,
            Map<String, Double> monthlyTotals,
            double totalSpent,
            long transactionCount,
            Map<String, Object> kpis) {

        List<Map<String, Object>> out = new ArrayList<>();

        if (transactionCount == 0) {
            out.add(rule("DATA_COVERAGE", "INFO", "No transactions loaded; KPI and trend rules are deferred."));
            return out;
        }

        double sumCategories = categoryTotals.values().stream().mapToDouble(Double::doubleValue).sum();
        double sumMonths = monthlyTotals.values().stream().mapToDouble(Double::doubleValue).sum();
        boolean aggOk =
                Math.abs(sumCategories - totalSpent) < EPS && Math.abs(sumMonths - totalSpent) < EPS;
        out.add(
                rule(
                        "AGGREGATION_INTEGRITY",
                        aggOk ? "PASS" : "WARN",
                        aggOk
                                ? "Category and monthly rollups reconcile to total spend within tolerance."
                                : "Rollup totals diverge from headline total; investigate pipeline or rounding."));

        @SuppressWarnings("unchecked")
        Map<String, Double> shares =
                (Map<String, Double>) kpis.getOrDefault("categorySharePercent", Map.of());
        String topCategory = null;
        double topSharePercent = 0.0;
        for (Map.Entry<String, Double> e : shares.entrySet()) {
            if (e.getValue() > topSharePercent) {
                topSharePercent = e.getValue();
                topCategory = e.getKey();
            }
        }
        if (topCategory != null && topSharePercent / 100.0 > CATEGORY_CONCENTRATION_THRESHOLD) {
            out.add(
                    rule(
                            "CATEGORY_CONCENTRATION",
                            "WARN",
                            String.format(
                                    "Category \"%s\" represents %.1f%% of lifetime spend (threshold %.0f%%).",
                                    topCategory, topSharePercent, CATEGORY_CONCENTRATION_THRESHOLD * 100)));
        } else {
            out.add(
                    rule(
                            "CATEGORY_CONCENTRATION",
                            "PASS",
                            "No single category exceeds the concentration threshold."));
        }

        Double mom = (Double) kpis.get("monthOverMonthChangePercent");
        if (mom != null && Math.abs(mom) > MOM_VELOCITY_THRESHOLD_PERCENT) {
            out.add(
                    rule(
                            "SPEND_VELOCITY_MOM",
                            "WARN",
                            String.format(
                                    "Month-over-month spend moved by %.1f%% (monitoring threshold %.0f%%).",
                                    mom, MOM_VELOCITY_THRESHOLD_PERCENT)));
        } else if (mom != null) {
            out.add(
                    rule(
                            "SPEND_VELOCITY_MOM",
                            "PASS",
                            String.format(
                                    "Month-over-month change (%.1f%%) is within the velocity band.", mom)));
        } else {
            out.add(
                    rule(
                            "SPEND_VELOCITY_MOM",
                            "INFO",
                            "Not enough consecutive months to score month-over-month velocity."));
        }

        List<String> months = new ArrayList<>(monthlyTotals.keySet());
        months.sort(Comparator.naturalOrder());
        Double t12 = (Double) kpis.get("trailingTwelveMonthAverage");
        if (t12 != null && t12 > EPS && months.size() >= 2) {
            String curM = months.get(months.size() - 1);
            double current = monthlyTotals.getOrDefault(curM, 0.0);
            if (current > t12 * BUDGET_PRESSURE_RATIO) {
                out.add(
                        rule(
                                "BUDGET_PRESSURE_INDEX",
                                "WARN",
                                String.format(
                                        "Current month spend is %.0f%% above the trailing-12 average, "
                                                + "signaling elevated burn vs recent baseline.",
                                                (current / t12 - 1.0) * 100.0)));
            } else {
                out.add(
                        rule(
                                "BUDGET_PRESSURE_INDEX",
                                "PASS",
                                "Current month is within normal range versus trailing-12 average."));
            }
        } else {
            out.add(
                    rule(
                            "BUDGET_PRESSURE_INDEX",
                            "INFO",
                            "Insufficient monthly history for budget-pressure comparison."));
        }

        return out;
    }

    private static Map<String, Object> rule(String id, String severity, String message) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("ruleId", id);
        m.put("severity", severity);
        m.put("message", message);
        return m;
    }
}
