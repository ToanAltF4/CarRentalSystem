package com.carrentalsystem.controller;

import com.carrentalsystem.dto.role.RoleDTO;
import com.carrentalsystem.entity.RoleEntity;
import com.carrentalsystem.repository.RoleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin Role Management Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/roles")
@RequiredArgsConstructor
@Tag(name = "Admin Role Management", description = "CRUD operations for roles")
public class AdminRoleController {

    private final RoleRepository roleRepository;

    @Operation(summary = "Get all roles")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        List<RoleDTO> roles = roleRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roles);
    }

    @Operation(summary = "Get role by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable Long id) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + id));
        return ResponseEntity.ok(toDTO(role));
    }

    @Operation(summary = "Create new role")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDTO> createRole(@RequestBody RoleDTO request) {
        log.info("Creating role: {}", request.getRoleName());

        // Ensure role name has ROLE_ prefix
        String roleName = request.getRoleName();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName.toUpperCase();
        }

        RoleEntity role = RoleEntity.builder()
                .roleName(roleName)
                .description(request.getDescription())
                .build();

        RoleEntity saved = roleRepository.save(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @Operation(summary = "Update role")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDTO> updateRole(@PathVariable Long id, @RequestBody RoleDTO request) {
        log.info("Updating role ID: {}", id);

        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + id));

        if (request.getRoleName() != null) {
            String roleName = request.getRoleName();
            if (!roleName.startsWith("ROLE_")) {
                roleName = "ROLE_" + roleName.toUpperCase();
            }
            role.setRoleName(roleName);
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        RoleEntity saved = roleRepository.save(role);
        return ResponseEntity.ok(toDTO(saved));
    }

    @Operation(summary = "Delete role")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        log.info("Deleting role ID: {}", id);

        if (!roleRepository.existsById(id)) {
            throw new IllegalArgumentException("Role not found: " + id);
        }

        roleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private RoleDTO toDTO(RoleEntity entity) {
        return RoleDTO.builder()
                .id(entity.getId())
                .roleName(entity.getRoleName())
                .description(entity.getDescription())
                .build();
    }
}
