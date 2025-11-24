package com.otakushop.service;

import com.otakushop.dto.UserResponse;
import com.otakushop.entity.User;
import com.otakushop.entity.Role;
import com.otakushop.repository.UserRepository;
import com.otakushop.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    public List<UserResponse> getAllUsers() {
        List<User> allUsers = userRepository.findAll();
        
        // Si es SUPERADMIN, puede ver todos los usuarios
        if (securityUtil.hasRole("SUPERADMIN")) {
            return allUsers.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        }
        
        // Si es ADMIN, solo puede ver CLIENTE y VENDEDOR (no otros ADMIN ni SUPERADMIN)
        if (securityUtil.hasRole("ADMIN")) {
            return allUsers.stream()
                    .filter(user -> user.getRole() == Role.CLIENTE || 
                                   user.getRole() == Role.VENDEDOR)
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        }
        
        // Otros roles no tienen acceso (ya protegido por @PreAuthorize)
        return List.of();
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertToResponse(user);
    }

    @Transactional
    public UserResponse updateUserRole(Long id, String roleValue) {
        // Validar que no sea nulo
        if (id == null || roleValue == null) {
            throw new IllegalArgumentException("ID y role no pueden ser nulos");
        }
        
        // Validar que el rol sea válido
        Role newRole;
        try {
            newRole = Role.fromValue(roleValue.toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Rol inválido: " + roleValue);
        }
        
        // Obtener el usuario a cambiar
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // NO PERMITIR: Cambiar a otro SUPERADMIN (solo uno debe existir)
        if (newRole == Role.SUPERADMIN && !targetUser.getRole().equals(Role.SUPERADMIN)) {
            throw new IllegalArgumentException("No se puede crear otro SUPERADMIN");
        }
        
        // NO PERMITIR: Cambiar rol del usuario actual a CLIENTE o VENDEDOR
        Long currentUserId = securityUtil.getCurrentUserId();
        if (id.equals(currentUserId) && (newRole == Role.CLIENTE || newRole == Role.VENDEDOR)) {
            throw new IllegalArgumentException("No puedes cambiar tu propio rol a CLIENTE o VENDEDOR");
        }
        
        // Hacer el cambio
        targetUser.setRole(newRole);
        targetUser = userRepository.save(targetUser);
        return convertToResponse(targetUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        // Validar que el usuario exista
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // NO PERMITIR: Eliminar SUPERADMIN
        if (userToDelete.getRole() == Role.SUPERADMIN) {
            throw new IllegalArgumentException("No se puede eliminar a un SUPERADMIN");
        }
        
        // NO PERMITIR: Eliminar otro ADMIN siendo ADMIN (solo SUPERADMIN puede)
        if (userToDelete.getRole() == Role.ADMIN && !securityUtil.hasRole("SUPERADMIN")) {
            throw new IllegalArgumentException("Solo SUPERADMIN puede eliminar a un ADMIN");
        }
        
        // SOFT DELETE: Marcar como deshabilitado en lugar de eliminar
        userToDelete.setEnabled(false);
        userRepository.save(userToDelete);
    }

    @Transactional
    public UserResponse suspendUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        user.setEnabled(false);
        user = userRepository.save(user);
        return convertToResponse(user);
    }

    private UserResponse convertToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
