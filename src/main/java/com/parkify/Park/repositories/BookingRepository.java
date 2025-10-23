package com.parkify.Park.repositories;

import com.parkify.Park.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Import Query
import org.springframework.data.repository.query.Param; // Import Param
import java.time.LocalDateTime; // Import LocalDateTime
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findBySlotIdAndStatus(Long slotId, String status);

    List<Booking> findByUserIdOrderByStartTimeDesc(Long userId);

    List<Booking> findAllBySlotId(Long slotId); // Needed for SlotService update

    // Finds any booking for a slot that overlaps with the requested time range.
    @Query("SELECT b FROM Booking b WHERE b.slot.id = :slotId AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(@Param("slotId") Long slotId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}