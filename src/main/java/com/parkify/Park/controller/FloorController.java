package com.parkify.Park.controller;

// No FloorDto import needed here
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

    // Change return type back to List<Floor>
    @GetMapping
    public List<Floor> getAllFloors() {
        return floorService.getAllFloorsWithVacancy(); // Call the updated service method
    }

    // Keep other endpoints as they were
    @GetMapping("/{id}")
    public ResponseEntity<Floor> getFloorById(@PathVariable Long id) {
        return floorService.getFloorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Floor> createFloor(@RequestBody FloorRequestDto floorDto) {
        Floor createdFloor = floorService.createFloor(floorDto);
        return new ResponseEntity<>(createdFloor, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Floor> updateFloor(@PathVariable Long id, @RequestBody FloorRequestDto floorDto) {
        try {
            Floor updatedFloor = floorService.updateFloor(id, floorDto);
            return ResponseEntity.ok(updatedFloor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFloor(@PathVariable Long id) {
        try {
            floorService.deleteFloor(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}