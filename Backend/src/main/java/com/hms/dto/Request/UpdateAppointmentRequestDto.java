package com.hms.dto.Request;

import com.hms.entity.type.AppointmentStatusType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAppointmentRequestDto {

    private AppointmentStatusType status;
}
