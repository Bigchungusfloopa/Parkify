package com.parkify.Park.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "bookings")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vehicleNumber;
    private Double price;

    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
    
    private String status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "bookings"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "slot_id")
    @JsonIgnoreProperties({"activeBooking", "floor"})
    private Slot slot;
}