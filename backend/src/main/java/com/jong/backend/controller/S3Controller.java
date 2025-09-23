package com.jong.backend.controller;

import com.jong.backend.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class S3Controller {
    private final S3Service s3Service;
    private static final int EXPIRATION_MINUTES = 60;

    @PostMapping("/post")
    public ResponseEntity<Map<String, String>> uploadPostImage(@RequestParam("file") MultipartFile file) {
        String url = s3Service.uploadFile(file, "post");
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/image")
    public ResponseEntity<Map<String, String>> getPresignedUrl(@RequestParam String url) {
        String imageUrl = s3Service.generatePresignedUrl(url, EXPIRATION_MINUTES);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }
}