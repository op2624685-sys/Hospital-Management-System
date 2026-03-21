package com.hms.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDepartmentListDto {
    private Long id;
    private String name;
    private String headDoctorName;
    private int memberCount;
    private String description;
    private String imageUrl;
    private String accentColor;
    private String bgColor;
    private String icon;
    private String sectionsJson;
}
