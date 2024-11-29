package com.egrid.road_damage_classification.controller;

import com.egrid.road_damage_classification.model.DamageAnalysisResponse;
import com.egrid.road_damage_classification.service.ApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
public class ApiController {

    private static final Logger logger = LoggerFactory.getLogger(ApiController.class);

    @Autowired
    private ApiService apiService;

    // Endpoint to analyze video
    @PostMapping("/analyze-video")
    public ResponseEntity<DamageAnalysisResponse> analyzeVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("damage_type") String damageType) {
        try {
            DamageAnalysisResponse response = apiService.analyzeVideo(file, damageType);

            // More robust null checking
            if (response == null) {
                logger.error("Received null response from API");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new DamageAnalysisResponse());
            }

            // Log the response for debugging
            logger.info("Received response: " + response);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the full stack trace for troubleshooting
            logger.error("Error analyzing video", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
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
            // Log the full stack trace for troubleshooting
            logger.error("Error predicting damage", e);
            return ResponseEntity.badRequest().body("Error predicting damage: " + e.getMessage());
        }
    }
}
