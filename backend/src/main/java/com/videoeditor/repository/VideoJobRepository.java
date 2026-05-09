package com.videoeditor.repository;

import com.videoeditor.model.VideoJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoJobRepository extends JpaRepository<VideoJob, Long> {
    List<VideoJob> findAllByOrderByCreatedAtDesc();
}
