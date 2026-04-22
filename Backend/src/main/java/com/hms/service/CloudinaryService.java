package com.hms.service;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {

    public Map upload(MultipartFile file);

}
