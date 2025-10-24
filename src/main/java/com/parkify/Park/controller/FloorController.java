package com.parkify.Park.controller;

import com.parkify.Park.dto.FloorRequestDto;
import com.parkify.Park.model.Floor;
import com.parkify.Park.service.FloorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/floors")
public class FloorController {

    @Autowired
    private FloorService floorService;

    // Get all floors (public)
    @GetMapping
    public List<Floor> getAllFloors() {
        return floorService.getAllFloorsWithVacancy();
    }

    // Get floor by ID (public)
    @GetMapping("/{id}")
    public ResponseEntity<Floor> getFloorById(@PathVariable Long id) {
        return floorService.getFloorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create floor (admin only)
    @PostMapping
    public ResponseEntity<Floor> createFloor(@RequestBody FloorRequestDto floorDto) {
        Floor createdFloor = floorService.createFloor(floorDto);
        return new ResponseEntity<>(createdFloor, HttpStatus.CREATED);
    }

    // Update floor (admin only)
    @PutMapping("/{id}")
    public ResponseEntity<Floor> updateFloor(@PathVariable Long id, @RequestBody FloorRequestDto floorDto) {
        try {
            Floor updatedFloor = floorService.updateFloor(id, floorDto);
            return ResponseEntity.ok(updatedFloor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete floor (admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFloor(@PathVariable Long id) {
        try {
            floorService.deleteFloor(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get all floors for admin (includes all data)
    @GetMapping("/admin/all")
    public ResponseEntity<List<Floor>> getAllFloorsForAdmin() {
        try {
            List<Floor> floors = floorService.getAllFloors();
            return ResponseEntity.ok(floors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}