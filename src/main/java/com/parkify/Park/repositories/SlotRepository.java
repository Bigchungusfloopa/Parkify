package com.parkify.Park.repositories;

import com.parkify.Park.model.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByFloorId(Long floorId);
    long countByFloorIdAndIsOccupied(Long floorId, boolean isOccupied);
    
    // ADDED: Count slots by occupied status across all floors
    long countByIsOccupied(boolean isOccupied);
    
    // Add these methods for slot management
    long countByFloorId(Long floorId);
    boolean existsByFloorIdAndSlotNumber(Long floorId, String slotNumber);
    void deleteAllByFloorId(Long floorId);
}