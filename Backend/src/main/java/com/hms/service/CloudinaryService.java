package com.hms.service;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {

    public Map upload(MultipartFile file);

    public Map uploadRaw(byte[] bytes, String fileName, String contentType);

}
