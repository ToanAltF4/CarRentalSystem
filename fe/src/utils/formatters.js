/**
 * Formats a number as Vietnamese Dong (VND).
 * Example: 1500000 -> "1,500,000 VND"
 * @param {number} price - The price in VND
 * @return {string} - Formatted price string
 */
export const formatPrice = (price) => {
    if (price === null || price === undefined) return '0 VND';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

/**
 * Returns the display label and color class for a booking/vehicle status.
 * @param {string} status - The backend enum status
 * @return {object} - { label, color, bg }
 */
export const formatStatus = (status) => {
    const statusMap = {
        // Booking Statuses
        'PENDING': { label: 'Pending Approval', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: 'Clock' },
        'CONFIRMED': { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-100', icon: 'CheckCircle' },
        'IN_PROGRESS': { label: 'In Progress', color: 'text-purple-600', bg: 'bg-purple-100', icon: 'Play' },
        'COMPLETED': { label: 'Completed', color: 'text-green-600', bg: 'bg-green-100', icon: 'Check' },
        'CANCELLED': { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50', icon: 'X' },

        // Vehicle Statuses
        'AVAILABLE': { label: 'Available', color: 'text-green-600', bg: 'bg-green-100' },
        'RENTED': { label: 'Rented', color: 'text-orange-600', bg: 'bg-orange-100' },
        'MAINTENANCE': { label: 'Maintenance', color: 'text-gray-600', bg: 'bg-gray-200' },
    };

    return statusMap[status] || { label: status, color: 'text-gray-600', bg: 'bg-gray-100' };
};
