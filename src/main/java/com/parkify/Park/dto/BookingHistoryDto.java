package com.parkify.Park.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingHistoryDto {
    private Long bookingId;
    private Long userId;        // ADDED
    private Long slotId;        // ADDED
    private String vehicleNumber;
    private Double price;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String slotNumber;
    private String floorName;
}