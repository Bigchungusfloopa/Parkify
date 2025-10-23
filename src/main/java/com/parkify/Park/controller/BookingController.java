package com.parkify.Park.controller;

import com.parkify.Park.dto.BookingRequestDto;
import com.parkify.Park.model.Booking;
import com.parkify.Park.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.parkify.Park.dto.BookingHistoryDto; // Import the new DTO
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingHistoryDto>> getHistory(@PathVariable Long userId) {
        List<BookingHistoryDto> history = bookingService.getBookingHistoryForUser(userId);
        return ResponseEntity.ok(history);
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
