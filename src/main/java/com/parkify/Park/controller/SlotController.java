
package com.parkify.Park.controller;

import com.parkify.Park.dto.SlotDto;
import com.parkify.Park.dto.SlotRequestDto;
import com.parkify.Park.model.Slot;
import com.parkify.Park.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class SlotController {

    @Autowired
    private SlotService slotService;

    // Get slots by floor (public) - This is the only public endpoint
    @GetMapping("/floors/{floorId}/slots")
    public List<SlotDto> getSlotsByFloor(@PathVariable Long floorId) {
        return slotService.getSlotsByFloorId(floorId);
    }
}