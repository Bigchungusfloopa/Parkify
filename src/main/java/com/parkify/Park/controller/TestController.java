package com.parkify.Park.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {
    @GetMapping
    public String hello() {
        return "Backend connection successful 🚀";
    }
}
