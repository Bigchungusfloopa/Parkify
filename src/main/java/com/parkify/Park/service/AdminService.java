package com.parkify.Park.service;

import com.parkify.Park.dto.FloorRequestDto;
import com.parkify.Park.dto.SlotRequestDto;
import com.parkify.Park.model.Booking;
import com.parkify.Park.model.Floor;
import com.parkify.Park.model.Slot;
import com.parkify.Park.model.User;
import com.parkify.Park.repositories.BookingRepository;
import com.parkify.Park.repositories.FloorRepository;
import com.parkify.Park.repositories.SlotRepository;
import com.parkify.Park.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FloorRepository floorRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private FloorService floorService;

    @Autowired
    private SlotService slotService;

    // --- Dashboard Statistics ---
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        long activeBookings = bookingRepository.countByStatus("ACTIVE");
        long totalFloors = floorRepository.count();
        long totalSlots = slotRepository.count();
        
        Double totalRevenue = bookingRepository.sumPriceByStatus("COMPLETED");
        if (totalRevenue == null) totalRevenue = 0.0;

        // FIXED: Calculate occupied and available slots correctly
        long occupiedSlots = slotRepository.countByIsOccupied(true);
        long availableSlots = totalSlots - occupiedSlots;
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalBookings", totalBookings);
        stats.put("activeBookings", activeBookings);
        stats.put("totalFloors", totalFloors);
        stats.put("totalSlots", totalSlots);
        stats.put("occupiedSlots", occupiedSlots);  // ADDED
        stats.put("availableSlots", availableSlots);
        stats.put("totalRevenue", totalRevenue);
        
        return stats;
    }

    // --- User Management ---
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setRole(role);
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    // --- Booking Management ---
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByStartTimeDesc();
    }

    // --- Floor Management ---
    public List<Floor> getAllFloors() {
        return floorRepository.findAll();
    }

    public Floor createFloor(FloorRequestDto floorDto) {
        return floorService.createFloor(floorDto);
    }

    public Floor updateFloor(Long floorId, FloorRequestDto floorDto) {
        return floorService.updateFloor(floorId, floorDto);
    }

    public void deleteFloor(Long floorId) {
        floorService.deleteFloor(floorId);
    }

    // --- Slot Management ---
    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    public List<Slot> getSlotsByFloorId(Long floorId) {
        return slotRepository.findByFloorId(floorId);
    }

    public Slot createSlot(SlotRequestDto slotDto) {
        return slotService.createSlot(slotDto);
    }

    public Slot updateSlot(Long slotId, SlotRequestDto slotDto) {
        return slotService.updateSlot(slotId, slotDto);
    }

    public void deleteSlot(Long slotId) {
        slotService.deleteSlot(slotId);
    }
}