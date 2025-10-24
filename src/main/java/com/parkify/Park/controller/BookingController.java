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



    // Add these endpoints to BookingController.java

// Update booking
@PutMapping("/{bookingId}")
public ResponseEntity<?> updateBooking(@PathVariable Long bookingId, @RequestBody BookingRequestDto bookingRequest) {
    try {
        Booking updatedBooking = bookingService.updateBooking(bookingId, bookingRequest);
        return ResponseEntity.ok(updatedBooking);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

// Cancel booking
@PutMapping("/{bookingId}/cancel")
public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
    try {
        bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok("Booking cancelled successfully");
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

// Delete booking (admin only)
@DeleteMapping("/{bookingId}")
public ResponseEntity<?> deleteBooking(@PathVariable Long bookingId) {
    try {
        bookingService.deleteBooking(bookingId);
        return ResponseEntity.ok("Booking deleted successfully");
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
}