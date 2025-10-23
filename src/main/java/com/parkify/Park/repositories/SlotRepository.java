package com.parkify.Park.repositories;

import com.parkify.Park.model.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByFloorId(Long floorId);

    long countByFloorIdAndIsOccupied(Long floorId, boolean isOccupied);

    // Add method to delete all slots belonging to a specific floor
    void deleteAllByFloorId(Long floorId);
}