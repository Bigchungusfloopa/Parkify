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

    // Get slots by floor for public (with DTO transformation)
    @Transactional(readOnly = true)
    public List<SlotDto> getSlotsByFloorId(Long floorId) {
        List<Slot> slots = slotRepository.findByFloorId(floorId);
        
        return slots.stream().map(slot -> {
            SlotDto dto = new SlotDto();
            dto.setId(slot.getId());
            dto.setSlotNumber(slot.getSlotNumber());
            dto.setType(slot.getType());
            dto.setOccupied(slot.isOccupied());

            List<Booking> allBookingsForSlot = bookingRepository.findBySlotId(slot.getId());

            // Find active booking
            allBookingsForSlot.stream()
                .filter(b -> "ACTIVE".equalsIgnoreCase(b.getStatus()))
                .findFirst()
                .ifPresent(activeBooking -> {
                    SlotDto.BookingInfoDto bookingInfo = new SlotDto.BookingInfoDto();
                    bookingInfo.setStartTime(activeBooking.getStartTime());
                    bookingInfo.setEndTime(activeBooking.getEndTime());
                    dto.setActiveBooking(bookingInfo);
                });

            // Create reservation times
            List<BookingTimeDto> reservationTimes = allBookingsForSlot.stream()
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

    // Get all slots for admin
    @Transactional(readOnly = true)
    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    // Get slots by floor for admin (raw entities)
    @Transactional(readOnly = true)
    public List<Slot> getSlotsByFloorIdForAdmin(Long floorId) {
        return slotRepository.findByFloorId(floorId);
    }

    // Create new slot
    @Transactional
    public Slot createSlot(SlotRequestDto slotDto) {
        Floor floor = floorRepository.findById(slotDto.getFloorId())
                .orElseThrow(() -> new RuntimeException("Floor not found with id: " + slotDto.getFloorId()));

        // Check if slot number already exists in this floor
        if (slotRepository.existsByFloorIdAndSlotNumber(slotDto.getFloorId(), slotDto.getSlotNumber())) {
            throw new RuntimeException("Slot number already exists in this floor");
        }

        Slot slot = new Slot();
        slot.setSlotNumber(slotDto.getSlotNumber());
        slot.setType(slotDto.getType());
        slot.setOccupied(slotDto.isOccupied());
        slot.setFloor(floor);

        Slot savedSlot = slotRepository.save(slot);

        // Update floor's total slots count
        updateFloorSlotCount(floor.getId());

        return savedSlot;
    }

    // Update slot
    @Transactional
    public Slot updateSlot(Long slotId, SlotRequestDto slotDto) {
        Slot existingSlot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found with id: " + slotId));

        // If floor changed, update the relationship
        if (!existingSlot.getFloor().getId().equals(slotDto.getFloorId())) {
            Floor newFloor = floorRepository.findById(slotDto.getFloorId())
                    .orElseThrow(() -> new RuntimeException("Floor not found with id: " + slotDto.getFloorId()));
            existingSlot.setFloor(newFloor);
        }

        // Check if slot number is being changed and if it conflicts
        if (!existingSlot.getSlotNumber().equals(slotDto.getSlotNumber()) &&
            slotRepository.existsByFloorIdAndSlotNumber(slotDto.getFloorId(), slotDto.getSlotNumber())) {
            throw new RuntimeException("Slot number already exists in this floor");
        }

        existingSlot.setSlotNumber(slotDto.getSlotNumber());
        existingSlot.setType(slotDto.getType());
        existingSlot.setOccupied(slotDto.isOccupied());

        Slot updatedSlot = slotRepository.save(existingSlot);

        // Update floor's total slots count
        updateFloorSlotCount(slotDto.getFloorId());

        return updatedSlot;
    }

    // Delete slot
    @Transactional
    public void deleteSlot(Long slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found with id: " + slotId));

        Long floorId = slot.getFloor().getId();
        slotRepository.delete(slot);

        // Update floor's total slots count
        updateFloorSlotCount(floorId);
    }

    // Helper method to update floor's total slots count
    private void updateFloorSlotCount(Long floorId) {
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new RuntimeException("Floor not found"));
        
        long totalSlots = slotRepository.countByFloorId(floorId);
        floor.setTotalSlots((int) totalSlots);
        floorRepository.save(floor);
    }
}