package com.parkify.Park.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // <-- Make sure this is imported
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "floors")
public class Floor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private int totalSlots;
    private String details;
    private String occupied;

    // This annotation tells the JSON converter to ignore this field for now,
    // which prevents the lazy loading error.
    @JsonIgnore 
    @OneToMany(mappedBy = "floor", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Slot> slots;
    @Transient // This field won't be saved in the database
    private long availableSlots;
}

