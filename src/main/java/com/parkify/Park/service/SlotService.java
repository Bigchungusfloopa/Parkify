package com.parkify.Park.service;

import com.parkify.Park.dto.BookingTimeDto;
import com.parkify.Park.dto.SlotDto;
import com.parkify.Park.model.Booking;
import com.parkify.Park.model.Slot;
import com.parkify.Park.repositories.BookingRepository;
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

    @Transactional(readOnly = true)
    public List<SlotDto> getSlotsByFloorId(Long floorId) {
        List<Slot> slots = slotRepository.findByFloorId(floorId);
        
        return slots.stream().map(slot -> {
            SlotDto dto = new SlotDto();
            dto.setId(slot.getId());
            dto.setSlotNumber(slot.getSlotNumber());
            dto.setType(slot.getType());
            dto.setOccupied(slot.isOccupied());

            // Fetch all bookings for this slot once
            List<Booking> allBookingsForSlot = bookingRepository.findAllBySlotId(slot.getId());

            // Find the currently active booking
            allBookingsForSlot.stream()
                .filter(b -> "ACTIVE".equalsIgnoreCase(b.getStatus()))
                .findFirst()
                .ifPresent(activeBooking -> {
                    SlotDto.BookingInfoDto bookingInfo = new SlotDto.BookingInfoDto();
                    bookingInfo.setStartTime(activeBooking.getStartTime());
                    bookingInfo.setEndTime(activeBooking.getEndTime());
                    dto.setActiveBooking(bookingInfo);
                });

            // Create a list of all reservation times
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
}