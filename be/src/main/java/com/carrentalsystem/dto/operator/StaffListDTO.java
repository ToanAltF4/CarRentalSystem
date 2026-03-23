package com.carrentalsystem.dto.operator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for listing available staff members.
 * Used by operators when assigning staff to bookings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffListDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role;

    /**
     * Number of active bookings currently assigned to this staff
     */
    private Integer currentAssignments;

    /**
     * Whether the staff is available for new assignments
     */
    private Boolean available;
}
