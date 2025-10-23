package com.parkify.Park.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SlotDto {
    private Long id;
    private String slotNumber;
    private String type;
    private boolean isOccupied;
    private BookingInfoDto activeBooking;
    private List<BookingTimeDto> reservations;

    // --- MANUAL SETTER TO FIX THE ERROR ---
    public void setOccupied(boolean isOccupied) {
        this.isOccupied = isOccupied;
    }
    // --- END MANUAL SETTER ---

    @Data
    public static class BookingInfoDto {
        @JsonFormat(pattern="yyyy-MM-dd, HH:mm")
        private LocalDateTime startTime;
        
        @JsonFormat(pattern="yyyy-MM-dd, HH:mm")
        private LocalDateTime endTime;
    }
}