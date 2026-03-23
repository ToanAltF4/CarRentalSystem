const DEFAULT_TIMEOUT_MINUTES = Number(import.meta.env.VITE_BOOKING_PAYMENT_TIMEOUT_MINUTES || 15);

const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const getPaymentTimeoutMinutes = () => DEFAULT_TIMEOUT_MINUTES;

export const getBookingPaymentDeadline = (booking) => {
    const createdAt = toDate(booking?.createdAt);
    if (!createdAt) return null;
    return new Date(createdAt.getTime() + DEFAULT_TIMEOUT_MINUTES * 60 * 1000);
};

export const getRemainingPaymentMs = (booking, nowMs = Date.now()) => {
    const deadline = getBookingPaymentDeadline(booking);
    if (!deadline) return null;
    return deadline.getTime() - nowMs;
};

export const formatRemainingPaymentTime = (remainingMs) => {
    if (remainingMs == null) return '';
    const clampedMs = Math.max(0, remainingMs);
    const totalSeconds = Math.floor(clampedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
