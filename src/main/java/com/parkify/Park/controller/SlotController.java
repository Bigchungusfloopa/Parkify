package com.parkify.Park.controller;

import com.parkify.Park.dto.SlotDto; // Import SlotDto
import com.parkify.Park.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class SlotController {

    @Autowired
    private SlotService slotService;

    // Change the return type to List<SlotDto>
    @GetMapping("/floors/{floorId}/slots")
    public List<SlotDto> getSlotsByFloor(@PathVariable Long floorId) {
        return slotService.getSlotsByFloorId(floorId);
    }
}