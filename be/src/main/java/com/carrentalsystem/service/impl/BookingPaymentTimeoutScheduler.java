package com.carrentalsystem.service.impl;

import com.carrentalsystem.entity.BookingEntity;
import com.carrentalsystem.entity.BookingStatus;
import com.carrentalsystem.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingPaymentTimeoutScheduler {

    private final BookingRepository bookingRepository;

    @Value("${app.booking.payment-timeout-minutes:15}")
    private long paymentTimeoutMinutes;

    @Scheduled(cron = "${app.booking.payment-timeout-cron:0 * * * * *}")
    @Transactional
    public void cancelExpiredPendingBookings() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(paymentTimeoutMinutes);
        List<BookingEntity> expiredPendingBookings = bookingRepository.findByStatusAndCreatedAtBefore(
                BookingStatus.PENDING,
                cutoff);

        if (expiredPendingBookings.isEmpty()) {
            return;
        }

        expiredPendingBookings.forEach(booking -> booking.setStatus(BookingStatus.CANCELLED));
        bookingRepository.saveAll(expiredPendingBookings);

        log.info("Auto-cancelled {} pending booking(s) unpaid after {} minute(s)",
                expiredPendingBookings.size(),
                paymentTimeoutMinutes);
    }
}
