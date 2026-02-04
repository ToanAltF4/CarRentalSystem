package com.carrentalsystem.repository;

import com.carrentalsystem.entity.InvoiceEntity;
import com.carrentalsystem.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Invoice operations.
 */
@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceEntity, Long> {

    Optional<InvoiceEntity> findByInvoiceNumber(String invoiceNumber);

    Optional<InvoiceEntity> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);

    List<InvoiceEntity> findByPaymentStatusOrderByIdDesc(PaymentStatus status);

    @Query("SELECT SUM(i.totalAmount) FROM InvoiceEntity i WHERE i.paymentStatus = :status")
    BigDecimal sumTotalAmountByPaymentStatus(@Param("status") com.carrentalsystem.entity.PaymentStatus status);
}
