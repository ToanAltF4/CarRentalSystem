import api from './api';

const paymentService = {
    createVnpayPayment: async (booking) => {
        const response = await api.post('/payments/vnpay/create', {
            bookingId: booking?.id,
            bookingCode: booking?.bookingCode,
        });
        return response.data;
    },

    createVnpayInvoicePayment: async (invoiceId) => {
        const response = await api.post('/payments/vnpay/create', {
            invoiceId: invoiceId,
        });
        return response.data;
    },

    getInvoiceByBookingId: async (bookingId) => {
        const response = await api.get(`/invoices/booking/${bookingId}`);
        return response.data;
    },
};

export default paymentService;
