package com.parkify.Park.controller;

import com.parkify.Park.dto.FloorRequestDto;
import com.parkify.Park.dto.SlotRequestDto;
import com.parkify.Park.model.Booking;
import com.parkify.Park.model.Floor;
import com.parkify.Park.model.Slot;
import com.parkify.Park.model.User;
import com.parkify.Park.service.AdminService;
import com.parkify.Park.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private BookingService bookingService;

    // ==================== DASHBOARD ENDPOINTS ====================

    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            Map<String, Object> stats = adminService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== USER MANAGEMENT ENDPOINTS ====================

    /**
     * Get all users
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = adminService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update user role
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String role = request.get("role");
            User user = adminService.updateUserRole(userId, role);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Delete user
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== BOOKING MANAGEMENT ENDPOINTS ====================

    /**
     * Get all bookings
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        try {
            List<Booking> bookings = adminService.getAllBookings();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Cancel any booking (admin)
     */
    @PutMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<?> adminCancelBooking(@PathVariable Long bookingId) {
        try {
            bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok("Booking cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Delete any booking (admin)
     */
    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<?> adminDeleteBooking(@PathVariable Long bookingId) {
        try {
            bookingService.deleteBooking(bookingId);
            return ResponseEntity.ok("Booking deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== FLOOR MANAGEMENT ENDPOINTS ====================

    /**
     * Get all floors
     */
    @GetMapping("/floors")
    public ResponseEntity<List<Floor>> getAllFloors() {
        try {
            List<Floor> floors = adminService.getAllFloors();
            return ResponseEntity.ok(floors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Create new floor
     */
    @PostMapping("/floors")
    public ResponseEntity<?> createFloor(@RequestBody FloorRequestDto floorDto) {
        try {
            Floor floor = adminService.createFloor(floorDto);
            return ResponseEntity.ok(floor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Update floor
     */
    @PutMapping("/floors/{floorId}")
    public ResponseEntity<?> updateFloor(@PathVariable Long floorId, @RequestBody FloorRequestDto floorDto) {
        try {
            Floor floor = adminService.updateFloor(floorId, floorDto);
            return ResponseEntity.ok(floor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Delete floor
     */
    @DeleteMapping("/floors/{floorId}")
    public ResponseEntity<?> deleteFloor(@PathVariable Long floorId) {
        try {
            adminService.deleteFloor(floorId);
            return ResponseEntity.ok("Floor deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== SLOT MANAGEMENT ENDPOINTS ====================

    /**
     * Get all slots
     */
    @GetMapping("/slots")
    public ResponseEntity<List<Slot>> getAllSlots() {
        try {
            List<Slot> slots = adminService.getAllSlots();
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get slots by floor
     */
    @GetMapping("/floors/{floorId}/slots")
    public ResponseEntity<List<Slot>> getSlotsByFloor(@PathVariable Long floorId) {
        try {
            List<Slot> slots = adminService.getSlotsByFloorId(floorId);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Create new slot
     */
    @PostMapping("/slots")
    public ResponseEntity<?> createSlot(@RequestBody SlotRequestDto slotDto) {
        try {
            Slot slot = adminService.createSlot(slotDto);
            return ResponseEntity.ok(slot);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Update slot
     */
    @PutMapping("/slots/{slotId}")
    public ResponseEntity<?> updateSlot(@PathVariable Long slotId, @RequestBody SlotRequestDto slotDto) {
        try {
            Slot slot = adminService.updateSlot(slotId, slotDto);
            return ResponseEntity.ok(slot);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Delete slot
     */
    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long slotId) {
        try {
            adminService.deleteSlot(slotId);
            return ResponseEntity.ok("Slot deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}