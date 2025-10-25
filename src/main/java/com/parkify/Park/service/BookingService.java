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
    private static final double HANDICAP_SURCHARGE = 0.0;

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

    // --- FIXED: Update expired bookings and slot statuses ---
    @Transactional
    public void updateExpiredBookings() {
        LocalDateTime now = LocalDateTime.now();
        
        // Get all active bookings
        List<Booking> activeBookings = bookingRepository.findByStatus("ACTIVE");
        
        for (Booking booking : activeBookings) {
            // If booking has ended, mark it as completed and free the slot
            if (booking.getEndTime() != null && booking.getEndTime().isBefore(now)) {
                booking.setStatus("COMPLETED");
                bookingRepository.save(booking);
                
                // Free up the slot
                Slot slot = booking.getSlot();
                if (slot != null) {
                    slot.setOccupied(false);
                    slotRepository.save(slot);
                }
            }
        }
    }

    // --- Create Booking Method ---
    @Transactional
    public Booking createBooking(BookingRequestDto bookingRequest) {
        // FIRST: Update expired bookings to ensure accurate slot availability
        updateExpiredBookings();
        
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

        // FIXED: Only mark slot as occupied if the booking starts NOW or in the past
        LocalDateTime now = LocalDateTime.now();
        boolean shouldOccupyNow = bookingRequest.getStartTime().isBefore(now) || 
                                  bookingRequest.getStartTime().isEqual(now);
        
        if (shouldOccupyNow) {
            slot.setOccupied(true);
            slotRepository.save(slot);
        }

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

    // --- Update Booking Method ---
    @Transactional
    public Booking updateBooking(Long bookingId, BookingRequestDto bookingRequest) {
        // Update expired bookings first
        updateExpiredBookings();
        
        Booking existingBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        // Validate vehicle number
        if (!isValidVehicleNumber(bookingRequest.getVehicleNumber())) {
            throw new RuntimeException("Invalid vehicle number format.");
        }

        // Check for conflicting bookings (excluding the current booking)
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookingsExcludingCurrent(
                bookingRequest.getSlotId(),
                bookingRequest.getStartTime(),
                bookingRequest.getEndTime(),
                bookingId
        );

        if (!conflictingBookings.isEmpty()) {
            throw new RuntimeException("This time slot is unavailable or already booked.");
        }

        // Find the slot
        Slot slot = slotRepository.findById(bookingRequest.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        // Calculate new price
        double calculatedPrice = calculateBookingPrice(slot, bookingRequest.getStartTime(), bookingRequest.getEndTime());

        // Update booking details
        existingBooking.setVehicleNumber(bookingRequest.getVehicleNumber().toUpperCase().replaceAll("[- ]", ""));
        existingBooking.setStartTime(bookingRequest.getStartTime());
        existingBooking.setEndTime(bookingRequest.getEndTime());
        existingBooking.setPrice(calculatedPrice);

        return bookingRepository.save(existingBooking);
    }

    // --- Cancel Booking Method ---
    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        // Free up the slot
        Slot slot = booking.getSlot();
        if (slot != null) {
            slot.setOccupied(false);
            slotRepository.save(slot);
        }

        // Update booking status
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    // --- Delete Booking Permanently (Admin Only) ---
    @Transactional
    public void deleteBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        
        // If the booking was active, free up the slot
        if ("ACTIVE".equals(booking.getStatus())) {
            Slot slot = booking.getSlot();
            if (slot != null) {
                slot.setOccupied(false);
                slotRepository.save(slot);
            }
        }
        
        bookingRepository.deleteById(bookingId);
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

            // Determine status: "COMPLETED" if endTime is in the past, otherwise use DB status
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
        double durationHours = Math.max(1.0, Math.ceil(durationMinutes / 60.0));

        double hourlyRate = BASE_RATE_PER_HOUR;
        String slotType = slot.getType();

        if (slotType != null) {
            if (slotType.equals("EV") || slotType.equals("Two-Wheeler-EV")) {
                hourlyRate += EV_SURCHARGE;
            } else if (slotType.equals("VIP")) {
                hourlyRate += VIP_SURCHARGE;
            } else if (slotType.equals("Handicap")) {
                hourlyRate += HANDICAP_SURCHARGE;
            }
        }

        return hourlyRate * durationHours;
    }
}