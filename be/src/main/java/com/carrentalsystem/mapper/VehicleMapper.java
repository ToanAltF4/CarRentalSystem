package com.carrentalsystem.mapper;

import com.carrentalsystem.dto.vehicle.VehicleRequestDTO;
import com.carrentalsystem.dto.vehicle.VehicleResponseDTO;
import com.carrentalsystem.entity.VehicleEntity;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for Vehicle entity <-> DTO conversions.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VehicleMapper {

    /**
     * Convert request DTO to entity (for create)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "category", ignore = true)
    VehicleEntity toEntity(VehicleRequestDTO dto);

    /**
     * Convert entity to response DTO
     */
    VehicleResponseDTO toResponseDTO(VehicleEntity entity);

    /**
     * Convert list of entities to list of response DTOs
     */
    List<VehicleResponseDTO> toResponseDTOList(List<VehicleEntity> entities);

    /**
     * Update existing entity from request DTO (ignores null values)
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "category", ignore = true)
    void updateEntityFromDTO(VehicleRequestDTO dto, @MappingTarget VehicleEntity entity);
}
