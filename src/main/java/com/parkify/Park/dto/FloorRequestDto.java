// src/main/java/com/parkify/Park/dto/FloorRequestDto.java
package com.parkify.Park.dto;

import lombok.Data;

@Data
public class FloorRequestDto {
    private String name;
    private String details;
    // totalSlots will be calculated or managed separately
}