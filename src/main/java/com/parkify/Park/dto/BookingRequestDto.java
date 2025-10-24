package com.parkify.Park.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequestDto {
    private Long userId;
    private Long slotId;
    private String vehicleNumber;
    
    // FIXED: Updated date format to match frontend
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;
    
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
}