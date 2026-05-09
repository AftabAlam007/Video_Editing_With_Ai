package com.videoeditor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.videoeditor.model.VideoJob;
import com.videoeditor.repository.VideoJobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class VideoProcessingService {

    @Autowired
    private VideoJobRepository repository;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @Value("${app.callback.base-url:http://localhost:8080}")
    private String callbackBaseUrl;

    // We'll use absolute paths based on user directory or a relative to project
    private final Path rootLocationUploads = Paths.get("../uploads").toAbsolutePath().normalize();
    private final Path rootLocationOutputs = Paths.get("../outputs").toAbsolutePath().normalize();

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public VideoProcessingService() {
        try {
            Files.createDirectories(rootLocationUploads);
            Files.createDirectories(rootLocationOutputs);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directories", e);
        }
    }

    public VideoJob createJobAndUpload(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".mp4";
        String uniqueFileName = UUID.randomUUID().toString() + extension;
        
        Path destinationFile = rootLocationUploads.resolve(uniqueFileName);
        file.transferTo(destinationFile.toFile());

        VideoJob job = new VideoJob();
        job.setOriginalFilename(originalFilename);
        job.setStoredInputPath(destinationFile.toString());
        job.setStatus("UPLOADED");
        job.setProgressPercentage(0);
        job.setProgressMessage("Video uploaded");

        return repository.save(job);
    }

    public void processVideoJobAsync(Long jobId, String prompt) {
        new Thread(() -> {
            VideoJob job = repository.findById(jobId).orElse(null);
            if (job == null) return;

            try {
                job.setUserPrompt(prompt);
                job.setStatus("PROCESSING");
                job.setProgressPercentage(5);
                job.setProgressMessage("Preparing AI edit");
                repository.save(job);

                // Call Python AI Service
                String aiUrl = aiServiceUrl + "/process";

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                body.add("file", new FileSystemResource(new File(job.getStoredInputPath())));
                body.add("prompt", job.getUserPrompt());
                body.add("job_id", String.valueOf(jobId));
                body.add("progress_callback_url", callbackBaseUrl + "/api/videos/" + jobId + "/progress");

                HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(aiUrl, requestEntity, String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    // Python service should return a JSON with output_path or we assume standard output location
                    // For simplicity, let's assume Python service saves to ../outputs/output_{jobId}.mp4 and returns path
                    String outputPath = rootLocationOutputs.resolve("output_" + jobId + ".mp4").toString();
                    String progressMessage = "Video ready";
                    String responseBody = response.getBody();

                    if (responseBody != null && !responseBody.trim().isEmpty()) {
                        try {
                            JsonNode responseJson = objectMapper.readTree(responseBody);
                            if (responseJson.hasNonNull("output_path")) {
                                outputPath = responseJson.get("output_path").asText();
                            }
                            if (responseJson.hasNonNull("message")) {
                                progressMessage = responseJson.get("message").asText();
                            }
                        } catch (Exception ignored) {
                            // Keep the default output path/message if the AI service sends non-JSON text.
                        }
                    }
                    
                    job.setStoredOutputPath(outputPath);
                    job.setStatus("COMPLETED");
                    job.setProgressPercentage(100);
                    job.setProgressMessage(progressMessage);
                    job.setCompletedAt(LocalDateTime.now());
                } else {
                    job.setStatus("FAILED");
                    job.setProgressMessage("AI service failed");
                    job.setErrorMessage("AI Service returned error code: " + response.getStatusCodeValue());
                }

            } catch (Exception e) {
                job.setStatus("FAILED");
                job.setProgressMessage("Processing failed");
                job.setErrorMessage(e.getMessage());
            } finally {
                repository.save(job);
            }
        }).start();
    }

    public VideoJob updateJobProgress(Long jobId, Integer progressPercentage, String progressMessage, String status) {
        VideoJob job = repository.findById(jobId).orElse(null);
        if (job == null) {
            return null;
        }

        if (progressPercentage != null) {
            int boundedProgress = Math.max(0, Math.min(100, progressPercentage));
            job.setProgressPercentage(boundedProgress);
        }

        if (progressMessage != null && !progressMessage.trim().isEmpty()) {
            job.setProgressMessage(progressMessage.trim());
        }

        if (status != null && !status.trim().isEmpty()) {
            job.setStatus(status.trim());
        }

        return repository.save(job);
    }

    public VideoJob getJobStatus(Long jobId) {
        return repository.findById(jobId).orElse(null);
    }

    public List<VideoJob> getAllJobs() {
        return repository.findAllByOrderByCreatedAtDesc();
    }
}
