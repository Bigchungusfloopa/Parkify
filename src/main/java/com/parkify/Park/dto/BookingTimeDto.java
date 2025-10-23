package com.parkify.Park.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingTimeDto {
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss") // ISO format for easy JS parsing
    private LocalDateTime startTime;

    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
}