package com.parkify.Park.config;

import com.parkify.Park.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class ScheduledTasks {

    @Autowired
    private BookingService bookingService;

    /**
     * Automatically update expired bookings every minute
     * This ensures slots are freed up when bookings end
     */
    @Scheduled(fixedRate = 60000) // Run every 60 seconds (1 minute)
    public void updateExpiredBookingsTask() {
        try {
            bookingService.updateExpiredBookings();
            System.out.println("✓ Checked and updated expired bookings at: " + java.time.LocalDateTime.now());
        } catch (Exception e) {
            System.err.println("Error updating expired bookings: " + e.getMessage());
        }
    }
}