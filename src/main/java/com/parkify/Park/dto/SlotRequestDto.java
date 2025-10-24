package com.parkify.Park.dto;

import lombok.Data;

@Data
public class SlotRequestDto {
    private String slotNumber;
    private String type;
    private Long floorId;
    private boolean isOccupied;
}