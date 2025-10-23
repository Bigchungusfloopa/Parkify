package com.parkify.Park.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingHistoryDto {
    private Long bookingId;
    private String slotNumber;
    private String floorName;
    private String vehicleNumber;
    private String status;
    private Double price;

    @JsonFormat(pattern="yyyy-MM-dd, HH:mm")
    private LocalDateTime startTime;
    
    @JsonFormat(pattern="yyyy-MM-dd, HH:mm")
    private LocalDateTime endTime;
}