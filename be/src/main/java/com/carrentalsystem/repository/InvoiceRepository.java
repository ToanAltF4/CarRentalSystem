package com.carrentalsystem.repository;

import com.carrentalsystem.entity.InvoiceEntity;
import com.carrentalsystem.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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

    java.util.Optional<InvoiceEntity> findByInvoiceNumber(String invoiceNumber);
}
