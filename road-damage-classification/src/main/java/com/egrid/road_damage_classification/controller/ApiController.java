package com.egrid.road_damage_classification.controller;

import com.egrid.road_damage_classification.model.DamageAnalysisResponse;
import com.egrid.road_damage_classification.service.ApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private ApiService apiService;

    // Endpoint to analyze video
    @PostMapping("/analyze-video")
    public ResponseEntity<DamageAnalysisResponse> analyzeVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("damage_type") String damageType) {
        try {
            DamageAnalysisResponse response = apiService.analyzeVideo(file, damageType);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Endpoint to predict damage from an image
    @PostMapping("/predict")
    public ResponseEntity<String> predictDamage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("damage_type") String damageType) {
        try {
            String response = apiService.predictDamage(file, damageType);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error predicting damage: " + e.getMessage());
        }
    }
}
