package com.parkify.Park.repositories;

import com.parkify.Park.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // Existing methods
    List<Booking> findByUserIdOrderByStartTimeDesc(Long userId);
    
    // FIXED: Add @Query annotation for the complex method
    @Query("SELECT b FROM Booking b WHERE b.slot.id = :slotId AND " +
           "((b.startTime BETWEEN :startTime AND :endTime) OR " +
           "(b.endTime BETWEEN :startTime AND :endTime) OR " +
           "(b.startTime <= :startTime AND b.endTime >= :endTime))")
    List<Booking> findConflictingBookings(@Param("slotId") Long slotId, 
                                         @Param("startTime") java.time.LocalDateTime startTime, 
                                         @Param("endTime") java.time.LocalDateTime endTime);
    
    // New methods for admin
    long countByStatus(String status);

    // Add this method to BookingRepository.java
    @Query("SELECT b FROM Booking b WHERE b.slot.id = :slotId AND " +
       "((b.startTime BETWEEN :startTime AND :endTime) OR " +
       "(b.endTime BETWEEN :startTime AND :endTime) OR " +
       "(b.startTime <= :startTime AND b.endTime >= :endTime)) AND " +
       "b.id != :excludeBookingId")
    List<Booking> findConflictingBookingsExcludingCurrent(@Param("slotId") Long slotId, 
                                                     @Param("startTime") LocalDateTime startTime, 
                                                     @Param("endTime") LocalDateTime endTime,
                                                     @Param("excludeBookingId") Long excludeBookingId);
    
    @Query("SELECT SUM(b.price) FROM Booking b WHERE b.status = :status")
    Double sumPriceByStatus(String status);
    
    List<Booking> findAllByOrderByStartTimeDesc();
    
    // ADD THIS METHOD to fix the redline error in SlotService
    List<Booking> findBySlotId(Long slotId);
}