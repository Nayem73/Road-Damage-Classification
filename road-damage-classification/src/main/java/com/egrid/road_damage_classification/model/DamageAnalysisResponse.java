package com.egrid.road_damage_classification.model;

import java.util.Map;

public class DamageAnalysisResponse {
    private Map<String, Double> summary;
    private int totalFrames;
    private int analyzedFrames;
    private Map<String, Integer> damageCounts;
    private Map<String, Double> damagePercentage;
    private String[] criticalFrames;

    public DamageAnalysisResponse() {
    }

    public DamageAnalysisResponse(Map<String, Double> summary, int totalFrames, int analyzedFrames, Map<String, Integer> damageCounts, Map<String, Double> damagePercentage, String[] criticalFrames) {
        this.summary = summary;
        this.totalFrames = totalFrames;
        this.analyzedFrames = analyzedFrames;
        this.damageCounts = damageCounts;
        this.damagePercentage = damagePercentage;
        this.criticalFrames = criticalFrames;
    }

    public Map<String, Double> getSummary() {
        return summary;
    }

    public void setSummary(Map<String, Double> summary) {
        this.summary = summary;
    }

    public int getTotalFrames() {
        return totalFrames;
    }

    public void setTotalFrames(int totalFrames) {
        this.totalFrames = totalFrames;
    }

    public int getAnalyzedFrames() {
        return analyzedFrames;
    }

    public void setAnalyzedFrames(int analyzedFrames) {
        this.analyzedFrames = analyzedFrames;
    }

    public Map<String, Integer> getDamageCounts() {
        return damageCounts;
    }

    public void setDamageCounts(Map<String, Integer> damageCounts) {
        this.damageCounts = damageCounts;
    }

    public Map<String, Double> getDamagePercentage() {
        return damagePercentage;
    }

    public void setDamagePercentage(Map<String, Double> damagePercentage) {
        this.damagePercentage = damagePercentage;
    }

    public String[] getCriticalFrames() {
        return criticalFrames;
    }

    public void setCriticalFrames(String[] criticalFrames) {
        this.criticalFrames = criticalFrames;
    }
}
