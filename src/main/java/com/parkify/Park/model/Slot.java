package com.parkify.Park.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "slots")
public class Slot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String slotNumber;
    private String type;
    private boolean isOccupied;

    // REMOVED: The OneToOne activeBooking relationship that was causing issues
    // We'll fetch active bookings through the BookingRepository instead

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id")
    @JsonIgnore
    private Floor floor;
}