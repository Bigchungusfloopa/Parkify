package com.parkify.Park.service;

import com.parkify.Park.dto.BookingTimeDto;
import com.parkify.Park.dto.SlotDto;
import com.parkify.Park.dto.SlotRequestDto;
import com.parkify.Park.model.Booking;
import com.parkify.Park.model.Floor;
import com.parkify.Park.model.Slot;
import com.parkify.Park.repositories.BookingRepository;
import com.parkify.Park.repositories.FloorRepository;
import com.parkify.Park.repositories.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SlotService {

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FloorRepository floorRepository;

    @Autowired
    private BookingService bookingService;

    // FIXED: Get slots by floor for public (with real-time status updates)
    @Transactional
    public List<SlotDto> getSlotsByFloorId(Long floorId) {
        // FIRST: Update expired bookings before fetching slots
        try {
            bookingService.updateExpiredBookings();
        } catch (Exception e) {
            System.err.println("Warning: Could not update expired bookings: " + e.getMessage());
            // Continue anyway - don't fail the whole request
        }
        
        List<Slot> slots = slotRepository.findByFloorId(floorId);
        LocalDateTime now = LocalDateTime.now();
        
        return slots.stream().map(slot -> {
            SlotDto dto = new SlotDto();
            dto.setId(slot.getId());
            dto.setSlotNumber(slot.getSlotNumber());
            dto.setType(slot.getType());

            // FIXED: Get all bookings for this slot safely
            List<Booking> allBookingsForSlot = bookingRepository.findBySlotId(slot.getId());

            // Filter only ACTIVE bookings that haven't ended yet
            List<Booking> activeBookings = allBookingsForSlot.stream()
                .filter(b -> "ACTIVE".equalsIgnoreCase(b.getStatus()))
                .filter(b -> b.getEndTime() != null && b.getEndTime().isAfter(now))
                .collect(Collectors.toList());

            // Check if there's a current active booking
            boolean hasCurrentActiveBooking = activeBookings.stream()
                .anyMatch(b -> b.getStartTime() != null && 
                              (b.getStartTime().isBefore(now) || b.getStartTime().isEqual(now)));

            // Set occupied status based on current active bookings
            dto.setOccupied(hasCurrentActiveBooking);
            
            // Update the slot in database if status changed
            if (slot.isOccupied() != hasCurrentActiveBooking) {
                slot.setOccupied(hasCurrentActiveBooking);
                slotRepository.save(slot);
            }

            // Find the currently active booking (if any)
            activeBookings.stream()
                .filter(b -> b.getStartTime() != null && 
                            (b.getStartTime().isBefore(now) || b.getStartTime().isEqual(now)))
                .findFirst()
                .ifPresent(activeBooking -> {
                    SlotDto.BookingInfoDto bookingInfo = new SlotDto.BookingInfoDto();
                    bookingInfo.setStartTime(activeBooking.getStartTime());
                    bookingInfo.setEndTime(activeBooking.getEndTime());
                    dto.setActiveBooking(bookingInfo);
                });

            // Create reservation times for all ACTIVE future bookings
            List<BookingTimeDto> reservationTimes = allBookingsForSlot.stream()
                .filter(b -> "ACTIVE".equalsIgnoreCase(b.getStatus()))
                .filter(b -> b.getEndTime() != null && b.getEndTime().isAfter(now))
                .map(booking -> {
                    BookingTimeDto timeDto = new BookingTimeDto();
                    timeDto.setStartTime(booking.getStartTime());
                    timeDto.setEndTime(booking.getEndTime());
                    return timeDto;
                })
                .collect(Collectors.toList());
            
            dto.setReservations(reservationTimes);
            
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Slot> getSlotsByFloorIdForAdmin(Long floorId) {
        return slotRepository.findByFloorId(floorId);
    }

    @Transactional
    public Slot createSlot(SlotRequestDto slotDto) {
        Floor floor = floorRepository.findById(slotDto.getFloorId())
                .orElseThrow(() -> new RuntimeException("Floor not found with id: " + slotDto.getFloorId()));

        if (slotRepository.existsByFloorIdAndSlotNumber(slotDto.getFloorId(), slotDto.getSlotNumber())) {
            throw new RuntimeException("Slot number already exists in this floor");
        }

        Slot slot = new Slot();
        slot.setSlotNumber(slotDto.getSlotNumber());
        slot.setType(slotDto.getType());
        slot.setOccupied(slotDto.isOccupied());
        slot.setFloor(floor);

        Slot savedSlot = slotRepository.save(slot);
        updateFloorSlotCount(floor.getId());

        return savedSlot;
    }

    @Transactional
    public Slot updateSlot(Long slotId, SlotRequestDto slotDto) {
        Slot existingSlot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found with id: " + slotId));

        if (!existingSlot.getFloor().getId().equals(slotDto.getFloorId())) {
            Floor newFloor = floorRepository.findById(slotDto.getFloorId())
                    .orElseThrow(() -> new RuntimeException("Floor not found with id: " + slotDto.getFloorId()));
            existingSlot.setFloor(newFloor);
        }

        if (!existingSlot.getSlotNumber().equals(slotDto.getSlotNumber()) &&
            slotRepository.existsByFloorIdAndSlotNumber(slotDto.getFloorId(), slotDto.getSlotNumber())) {
            throw new RuntimeException("Slot number already exists in this floor");
        }

        existingSlot.setSlotNumber(slotDto.getSlotNumber());
        existingSlot.setType(slotDto.getType());
        existingSlot.setOccupied(slotDto.isOccupied());

        Slot updatedSlot = slotRepository.save(existingSlot);
        updateFloorSlotCount(slotDto.getFloorId());

        return updatedSlot;
    }

    @Transactional
    public void deleteSlot(Long slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found with id: " + slotId));

        Long floorId = slot.getFloor().getId();
        slotRepository.delete(slot);
        updateFloorSlotCount(floorId);
    }

    private void updateFloorSlotCount(Long floorId) {
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new RuntimeException("Floor not found"));
        
        long totalSlots = slotRepository.countByFloorId(floorId);
        floor.setTotalSlots((int) totalSlots);
        floorRepository.save(floor);
    }
}