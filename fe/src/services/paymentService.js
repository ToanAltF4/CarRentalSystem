import api from './api';

const paymentService = {
    createVnpayPayment: async (booking) => {
        const response = await api.post('/payments/vnpay/create', {
            bookingId: booking?.id,
            bookingCode: booking?.bookingCode,
        });
        return response.data;
    },
};

export default paymentService;
