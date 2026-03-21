package com.hms.dto;

import java.io.Serializable;
import java.util.Set;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentDto implements Serializable {

    private Long id;
    private String name;
    private Long branchId;
    private Long headDoctorId;
    private Set<Long> doctorIds;
    private String headDoctorName;
    private Integer memberCount;
    private String description;
    private String imageUrl;
    private String accentColor;
    private String bgColor;
    private String icon;
    private String sectionsJson;

}
