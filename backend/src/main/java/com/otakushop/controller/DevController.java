package com.otakushop.controller;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dev")
public class DevController {
    private final BCryptPasswordEncoder passwordEncoder;

    public DevController() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/hash-password")
    public String hashPassword(@RequestParam String password) {
        return passwordEncoder.encode(password);
    }
}

