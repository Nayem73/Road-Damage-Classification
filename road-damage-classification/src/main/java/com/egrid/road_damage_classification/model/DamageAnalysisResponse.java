package com.egrid.road_damage_classification.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DamageAnalysisResponse {
    @JsonProperty("summary")
    private Summary summary;

    @JsonProperty("total_frames")
    private Integer totalFrames;

    @JsonProperty("analyzed_frames")
    private Integer analyzedFrames;

    @JsonProperty("damage_counts")
    private DamageCounts damageCounts;

    @JsonProperty("damage_percentage")
    private Double damagePercentage;

    @JsonProperty("critical_frames")
    private Integer criticalFrames;

    // Getters and setters
    public Summary getSummary() {
        return summary;
    }

    public void setSummary(Summary summary) {
        this.summary = summary;
    }

    public Integer getTotalFrames() {
        return totalFrames;
    }

    public void setTotalFrames(Integer totalFrames) {
        this.totalFrames = totalFrames;
    }

    public Integer getAnalyzedFrames() {
        return analyzedFrames;
    }

    public void setAnalyzedFrames(Integer analyzedFrames) {
        this.analyzedFrames = analyzedFrames;
    }

    public DamageCounts getDamageCounts() {
        return damageCounts;
    }

    public void setDamageCounts(DamageCounts damageCounts) {
        this.damageCounts = damageCounts;
    }

    public Double getDamagePercentage() {
        return damagePercentage;
    }

    public void setDamagePercentage(Double damagePercentage) {
        this.damagePercentage = damagePercentage;
    }

    public Integer getCriticalFrames() {
        return criticalFrames;
    }

    public void setCriticalFrames(Integer criticalFrames) {
        this.criticalFrames = criticalFrames;
    }

    // Nested classes
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DamageCounts {
        @JsonProperty("good")
        private Integer good;

        @JsonProperty("poor")
        private Integer poor;

        // Getters and setters
        public Integer getGood() {
            return good;
        }

        public void setGood(Integer good) {
            this.good = good;
        }

        public Integer getPoor() {
            return poor;
        }

        public void setPoor(Integer poor) {
            this.poor = poor;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Summary {
        @JsonProperty("good")
        private Double good;

        @JsonProperty("poor")
        private Double poor;

        @JsonProperty("satisfactory")
        private Double satisfactory;

        @JsonProperty("very_poor")
        private Double veryPoor;

        // Getters and setters
        public Double getGood() {
            return good;
        }

        public void setGood(Double good) {
            this.good = good;
        }

        public Double getPoor() {
            return poor;
        }

        public void setPoor(Double poor) {
            this.poor = poor;
        }

        public Double getSatisfactory() {
            return satisfactory;
        }

        public void setSatisfactory(Double satisfactory) {
            this.satisfactory = satisfactory;
        }

        public Double getVeryPoor() {
            return veryPoor;
        }

        public void setVeryPoor(Double veryPoor) {
            this.veryPoor = veryPoor;
        }
    }
}
