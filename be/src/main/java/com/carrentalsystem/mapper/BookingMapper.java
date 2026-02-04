package com.carrentalsystem.mapper;

import com.carrentalsystem.dto.booking.BookingRequestDTO;
import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.entity.BookingEntity;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for Booking entity <-> DTO conversions.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BookingMapper {

    /**
     * Convert request DTO to entity (partial - vehicle set in service)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bookingCode", ignore = true)
    @Mapping(target = "vehicle", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "rentalType", ignore = true)
    @Mapping(target = "pickupMethod", ignore = true)
    @Mapping(target = "driverId", ignore = true)
    @Mapping(target = "totalDays", ignore = true)
    @Mapping(target = "dailyRate", ignore = true)
    @Mapping(target = "rentalFee", ignore = true)
    @Mapping(target = "driverFee", ignore = true)
    @Mapping(target = "deliveryFee", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    BookingEntity toEntity(BookingRequestDTO dto);

    /**
     * Convert entity to response DTO with vehicle details.
     */
    @Mapping(source = "vehicle.id", target = "vehicleId")
    @Mapping(source = "vehicle.name", target = "vehicleName")
    @Mapping(source = "vehicle.brand", target = "vehicleBrand")
    @Mapping(source = "vehicle.model", target = "vehicleModel")
    @Mapping(source = "vehicle.licensePlate", target = "vehicleLicensePlate")
    @Mapping(source = "vehicle.imageUrl", target = "vehicleImage")
    @Mapping(source = "rentalType.id", target = "rentalTypeId")
    @Mapping(source = "rentalType.name", target = "rentalTypeName")
    BookingResponseDTO toResponseDTO(BookingEntity entity);

    /**
     * Convert list of entities to list of response DTOs.
     */
    List<BookingResponseDTO> toResponseDTOList(List<BookingEntity> entities);
}
