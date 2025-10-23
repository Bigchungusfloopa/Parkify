package com.parkify.Park.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity // Keep these annotations ABOVE the class
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vehicleNumber;

    // Remove the duplicate annotations from here

    private Double price; // Keep this field

    @JsonFormat(pattern="yyyy-MM-dd, HH:mm")
    private LocalDateTime startTime;

    @JsonFormat(pattern="yyyy-MM-dd, HH:mm")
    private LocalDateTime endTime;
    
    private String status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "slot_id")
    private Slot slot;
}