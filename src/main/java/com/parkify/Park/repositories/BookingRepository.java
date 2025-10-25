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
    
    @Query("SELECT b FROM Booking b WHERE b.slot.id = :slotId AND " +
           "((b.startTime BETWEEN :startTime AND :endTime) OR " +
           "(b.endTime BETWEEN :startTime AND :endTime) OR " +
           "(b.startTime <= :startTime AND b.endTime >= :endTime))")
    List<Booking> findConflictingBookings(@Param("slotId") Long slotId, 
                                         @Param("startTime") java.time.LocalDateTime startTime, 
                                         @Param("endTime") java.time.LocalDateTime endTime);
    
    // ADDED: Find bookings by status
    List<Booking> findByStatus(String status);
    
    long countByStatus(String status);

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
    
    List<Booking> findBySlotId(Long slotId);
}