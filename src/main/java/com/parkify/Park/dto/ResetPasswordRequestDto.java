package com.parkify.Park.dto;
import lombok.Data;
@Data public class ResetPasswordRequestDto { private String email; private String token; private String newPassword; }
