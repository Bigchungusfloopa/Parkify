package com.parkify.Park.service;

import com.parkify.Park.dto.BookingHistoryDto;
import com.parkify.Park.dto.BookingRequestDto;
import com.parkify.Park.model.Booking;
import com.parkify.Park.model.Slot;
import com.parkify.Park.model.User;
import com.parkify.Park.repositories.BookingRepository;
import com.parkify.Park.repositories.SlotRepository;
import com.parkify.Park.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class BookingService {

    // --- Pricing Constants ---
    private static final double BASE_RATE_PER_HOUR = 100.0;
    private static final double EV_SURCHARGE = 50.0;
    private static final double VIP_SURCHARGE = 100.0;

    // --- Validation Pattern ---
    private static final Pattern VEHICLE_NUMBER_PATTERN =
            Pattern.compile("^[A-Z]{2}[- ]?[0-9]{1,2}[- ]?[A-Z]{1,2}[- ]?[0-9]{1,4}$", Pattern.CASE_INSENSITIVE);

    // --- Repositories ---
    @Autowired
    private SlotRepository slotRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BookingRepository bookingRepository;

    // --- Create Booking Method ---
    @Transactional
    public Booking createBooking(BookingRequestDto bookingRequest) {
        // Validate vehicle number
        if (!isValidVehicleNumber(bookingRequest.getVehicleNumber())) {
            throw new RuntimeException("Invalid vehicle number format.");
        }

        // Find the slot
        Slot slot = slotRepository.findById(bookingRequest.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        // Check for conflicting bookings at the requested time
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
            bookingRequest.getSlotId(),
            bookingRequest.getStartTime(),
            bookingRequest.getEndTime()
        );

        if (!conflictingBookings.isEmpty()) {
            throw new RuntimeException("This time slot is unavailable or already booked.");
        }

        // Find the user
        User user = userRepository.findById(bookingRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculate the price
        double calculatedPrice = calculateBookingPrice(slot, bookingRequest.getStartTime(), bookingRequest.getEndTime());

        // Update slot status
        slot.setOccupied(true);
        slotRepository.save(slot);

        // Create the new booking record
        Booking booking = new Booking();
        booking.setSlot(slot);
        booking.setUser(user);
        booking.setVehicleNumber(bookingRequest.getVehicleNumber().toUpperCase().replaceAll("[- ]", ""));
        booking.setStartTime(bookingRequest.getStartTime());
        booking.setEndTime(bookingRequest.getEndTime());
        booking.setStatus("ACTIVE");
        booking.setPrice(calculatedPrice);

        return bookingRepository.save(booking);
    }

    // --- Get Booking History Method ---
    @Transactional(readOnly = true)
    public List<BookingHistoryDto> getBookingHistoryForUser(Long userId) {
        // Fetch bookings for the user, ordered by start time descending
        List<Booking> bookings = bookingRepository.findByUserIdOrderByStartTimeDesc(userId);
        LocalDateTime now = LocalDateTime.now();

        // Convert Booking entities to BookingHistoryDto objects
        return bookings.stream().map(booking -> {
            BookingHistoryDto dto = new BookingHistoryDto();
            dto.setBookingId(booking.getId());
            dto.setVehicleNumber(booking.getVehicleNumber());
            dto.setPrice(booking.getPrice());
            dto.setStartTime(booking.getStartTime());
            dto.setEndTime(booking.getEndTime());

            // FIXED: Better status calculation
            if (booking.getEndTime() != null && booking.getEndTime().isBefore(now)) {
                dto.setStatus("COMPLETED");
            } else if (booking.getStartTime() != null && booking.getStartTime().isAfter(now)) {
                dto.setStatus("UPCOMING");
            } else {
                dto.setStatus(booking.getStatus() != null ? booking.getStatus() : "ACTIVE");
            }

            // Safely add related slot and floor information
            if (booking.getSlot() != null) {
                dto.setSlotNumber(booking.getSlot().getSlotNumber());
                if (booking.getSlot().getFloor() != null) {
                    dto.setFloorName(booking.getSlot().getFloor().getName());
                }
            }
            return dto;
        }).collect(Collectors.toList());
    }

    // --- Helper Method: Validate Vehicle Number ---
    private boolean isValidVehicleNumber(String vehicleNumber) {
        if (vehicleNumber == null) {
            return false;
        }
        return VEHICLE_NUMBER_PATTERN.matcher(vehicleNumber.trim()).matches();
    }

    // --- Helper Method: Calculate Booking Price ---
    private double calculateBookingPrice(Slot slot, LocalDateTime startTime, LocalDateTime endTime) {
        if (endTime == null || startTime == null || endTime.isBefore(startTime)) {
             throw new RuntimeException("End time must be after start time.");
        }

        long durationMinutes = Duration.between(startTime, endTime).toMinutes();
        // Calculate hours: minimum 1 hour, round fractions up
        double durationHours = Math.max(1.0, Math.ceil(durationMinutes / 60.0));

        double hourlyRate = BASE_RATE_PER_HOUR;
        String slotType = slot.getType();

        // Add surcharges based on slot type
        if (slotType != null && (slotType.equals("EV") || slotType.equals("Two-Wheeler-EV"))) {
            hourlyRate += EV_SURCHARGE;
        } else if (slotType != null && slotType.equals("VIP")) {
            hourlyRate += VIP_SURCHARGE;
        }

        return hourlyRate * durationHours;
    }
}