package com.parkify.Park.service;

import com.parkify.Park.dto.FloorRequestDto;
import com.parkify.Park.model.Floor;
import com.parkify.Park.repositories.FloorRepository;
import com.parkify.Park.repositories.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class FloorService {

    @Autowired
    private FloorRepository floorRepository;

    @Autowired
    private SlotRepository slotRepository;

    // Get all floors with vacancy calculation (for public)
    @Transactional(readOnly = true)
    public List<Floor> getAllFloorsWithVacancy() {
        List<Floor> floors = floorRepository.findAll();
        floors.forEach(floor -> {
            long availableCount = slotRepository.countByFloorIdAndIsOccupied(floor.getId(), false);
            floor.setAvailableSlots(availableCount);
        });
        return floors;
    }

    // Get all floors without vacancy calculation (for admin)
    @Transactional(readOnly = true)
    public List<Floor> getAllFloors() {
        return floorRepository.findAll();
    }

    public Optional<Floor> getFloorById(Long id) {
        return floorRepository.findById(id);
    }

    public Floor createFloor(FloorRequestDto floorDto) {
        Floor newFloor = new Floor();
        newFloor.setName(floorDto.getName());
        newFloor.setDetails(floorDto.getDetails());
        newFloor.setTotalSlots(0); // Initialize total slots
        return floorRepository.save(newFloor);
    }

    public Floor updateFloor(Long id, FloorRequestDto floorDto) {
        Floor existingFloor = floorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Floor not found with id: " + id));
        existingFloor.setName(floorDto.getName());
        existingFloor.setDetails(floorDto.getDetails());
        // Note: totalSlots might need separate logic if slots are managed
        return floorRepository.save(existingFloor);
    }

    @Transactional
    public void deleteFloor(Long id) {
        if (!floorRepository.existsById(id)) {
            throw new RuntimeException("Floor not found with id: " + id);
        }
        slotRepository.deleteAllByFloorId(id); // Delete associated slots
        floorRepository.deleteById(id);
    }
}