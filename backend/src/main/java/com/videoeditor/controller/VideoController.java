package com.videoeditor.controller;

import com.videoeditor.model.VideoJob;
import com.videoeditor.service.VideoProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin("*")
public class VideoController {

    @Autowired
    private VideoProcessingService processingService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            VideoJob job = processingService.createJobAndUpload(file);
            return ResponseEntity.ok(job);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/{jobId}/process")
    public ResponseEntity<?> processVideo(@PathVariable Long jobId, @RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Prompt is required"));
        }

        VideoJob job = processingService.getJobStatus(jobId);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }

        // Start async processing
        processingService.processVideoJobAsync(jobId, prompt);

        return ResponseEntity.ok(Map.of("status", "PROCESSING", "message", "Processing started"));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<?> getJobStatus(@PathVariable Long jobId) {
        VideoJob job = processingService.getJobStatus(jobId);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(job);
    }

    @GetMapping("/history")
    public ResponseEntity<List<VideoJob>> getAllJobs() {
        return ResponseEntity.ok(processingService.getAllJobs());
    }

    @GetMapping("/{jobId}/download")
    public ResponseEntity<Resource> downloadVideo(@PathVariable Long jobId) {
        VideoJob job = processingService.getJobStatus(jobId);
        if (job == null || !"COMPLETED".equals(job.getStatus()) || job.getStoredOutputPath() == null) {
            return ResponseEntity.notFound().build();
        }

        File file = new File(job.getStoredOutputPath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.parseMediaType("video/mp4"))
                .body(resource);
    }
}
