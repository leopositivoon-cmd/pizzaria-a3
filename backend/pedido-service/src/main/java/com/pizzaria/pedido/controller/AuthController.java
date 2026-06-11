package com.pizzaria.pedido.controller;

import com.pizzaria.pedido.security.TokenService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody LoginRequest data) {
        // Usuário fixo conforme solicitado: admin/admin123
        if ("admin".equals(data.getLogin()) && "admin123".equals(data.getPassword())) {
            var token = tokenService.generateToken(data.getLogin());
            return ResponseEntity.ok(Map.of("token", token));
        }
        return ResponseEntity.status(401).build();
    }

    @Data
    public static class LoginRequest {
        private String login;
        private String password;
    }
}
