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
    @Mapping(target = "vehicleCategory", ignore = true)
    VehicleEntity toEntity(VehicleRequestDTO dto);

    /**
     * Convert entity to response DTO (basic fields only, service will enrich with
     * category/pricing)
     */
    @Mapping(source = "vehicleCategory.id", target = "categoryId")
    @Mapping(source = "vehicleCategory.brand", target = "categoryBrand")
    @Mapping(source = "vehicleCategory.name", target = "categoryName")
    @Mapping(source = "vehicleCategory.model", target = "categoryModel")
    @Mapping(source = "vehicleCategory.seats", target = "seats")
    @Mapping(source = "vehicleCategory.batteryCapacityKwh", target = "batteryCapacityKwh")
    @Mapping(source = "vehicleCategory.rangeKm", target = "rangeKm")
    @Mapping(source = "vehicleCategory.chargingTimeHours", target = "chargingTimeHours")
    @Mapping(source = "vehicleCategory.description", target = "description")
    @Mapping(source = "vehicleCategory.brand", target = "brand")
    @Mapping(source = "vehicleCategory.name", target = "name")
    @Mapping(source = "vehicleCategory.model", target = "model")
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "dailyPrice", ignore = true)
    @Mapping(target = "weeklyPrice", ignore = true)
    @Mapping(target = "monthlyPrice", ignore = true)
    @Mapping(target = "overtimeFeePerHour", ignore = true)
    @Mapping(target = "dailyRate", ignore = true)
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
    @Mapping(target = "vehicleCategory", ignore = true)
    void updateEntityFromDTO(VehicleRequestDTO dto, @MappingTarget VehicleEntity entity);
}
