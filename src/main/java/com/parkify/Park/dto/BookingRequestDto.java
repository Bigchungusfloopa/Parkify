package com.parkify.Park.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data // <-- This is the missing annotation that creates the methods
public class BookingRequestDto {
    private Long slotId;
    private Long userId;
    private String vehicleNumber;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
