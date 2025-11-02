package com.parkify.Park.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "floor_id")
    @JsonIgnoreProperties({"slots"})
    private Floor floor;
}