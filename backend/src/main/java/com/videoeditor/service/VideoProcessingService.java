package com.videoeditor.service;

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

    // We'll use absolute paths based on user directory or a relative to project
    private final Path rootLocationUploads = Paths.get("uploads").toAbsolutePath().normalize();
    private final Path rootLocationOutputs = Paths.get("outputs").toAbsolutePath().normalize();

    private final RestTemplate restTemplate = new RestTemplate();

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
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".mp4";
        String uniqueFileName = UUID.randomUUID().toString() + extension;

        Path destinationFile = rootLocationUploads.resolve(uniqueFileName);
        file.transferTo(destinationFile.toFile());

        VideoJob job = new VideoJob();
        job.setOriginalFilename(originalFilename);
        job.setStoredInputPath(destinationFile.toString());
        job.setStatus("UPLOADED");

        return repository.save(job);
    }

    public void processVideoJobAsync(Long jobId, String prompt) {
        new Thread(() -> {
            VideoJob job = repository.findById(jobId).orElse(null);
            if (job == null)
                return;

            try {
                job.setUserPrompt(prompt);
                job.setStatus("PROCESSING");
                repository.save(job);

                // Call Python AI Service
                String aiUrl = aiServiceUrl + "/process";

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                body.add("file", new FileSystemResource(new File(job.getStoredInputPath())));
                body.add("prompt", job.getUserPrompt());
                body.add("job_id", String.valueOf(jobId));

                HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(aiUrl, requestEntity, String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    // Python service should return a JSON with output_path or we assume standard
                    // output location
                    // For simplicity, let's assume Python service saves to
                    // ../outputs/output_{jobId}.mp4 and returns path
                    String outputPath = rootLocationOutputs.resolve("output_" + jobId + ".mp4").toString();

                    job.setStoredOutputPath(outputPath);
                    job.setStatus("COMPLETED");
                    job.setCompletedAt(LocalDateTime.now());
                } else {
                    job.setStatus("FAILED");
                    job.setErrorMessage("AI Service returned error code: " + response.getStatusCodeValue());
                }

            } catch (Exception e) {
                job.setStatus("FAILED");
                job.setErrorMessage(e.getMessage());
            } finally {
                repository.save(job);
            }
        }).start();
    }

    public VideoJob getJobStatus(Long jobId) {
        return repository.findById(jobId).orElse(null);
    }

    public List<VideoJob> getAllJobs() {
        return repository.findAllByOrderByCreatedAtDesc();
    }
}
