package com.parkify.Park.controller;

import com.parkify.Park.dto.BookingRequestDto;
import com.parkify.Park.dto.BookingHistoryDto;
import com.parkify.Park.model.Booking;
import com.parkify.Park.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // Fix the booking history endpoint
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingHistoryDto>> getBookingHistory(@PathVariable Long userId) {
        try {
            List<BookingHistoryDto> history = bookingService.getBookingHistoryForUser(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDto bookingRequest) {
        try {
            Booking newBooking = bookingService.createBooking(bookingRequest);
            return ResponseEntity.ok(newBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}