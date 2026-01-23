import { useState } from 'react';
import { X, CreditCard, CheckCircle, Loader2, Smartphone } from 'lucide-react';
import bookingService from '../../services/bookingService';

const PaymentModal = ({ booking, onClose, onSuccess }) => {
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('vnpay');

    const paymentMethods = [
        { id: 'vnpay', name: 'VNPay', icon: '💳', color: 'bg-blue-500' },
        { id: 'momo', name: 'MoMo', icon: '📱', color: 'bg-pink-500' },
        { id: 'zalopay', name: 'ZaloPay', icon: '💰', color: 'bg-blue-600' }
    ];

    const handlePayment = async () => {
        setProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Update booking status to IN_PROGRESS after payment
            await bookingService.updateStatus(booking.id, 'IN_PROGRESS');
            setSuccess(true);

            // Auto close after success
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err) {
            console.error('Payment failed:', err);
            alert('Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {success ? (
                    // Success State
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                        <p className="text-gray-500">Your booking has been confirmed.</p>
                    </div>
                ) : (
                    <>
                        {/* Booking Summary */}
                        <div className="px-6 py-4 bg-gray-50">
                            <div className="flex items-center gap-4">
                                <img
                                    src={booking.vehicleImage || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=100'}
                                    alt={booking.vehicleName}
                                    className="w-16 h-12 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{booking.vehicleName}</h4>
                                    <p className="text-sm text-gray-500">{booking.startDate} → {booking.endDate}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>
                            <div className="space-y-2">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        disabled={processing}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedMethod === method.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                            } disabled:opacity-50`}
                                    >
                                        <span className="text-2xl">{method.icon}</span>
                                        <span className="font-medium text-gray-900">{method.name}</span>
                                        {selectedMethod === method.id && (
                                            <CheckCircle size={20} className="ml-auto text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="px-6 py-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Amount</span>
                                <span className="text-2xl font-bold text-primary">${booking.totalAmount}</span>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <div className="px-6 py-4">
                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-hover transition-colors disabled:opacity-70"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={20} />
                                        Pay ${booking.totalAmount}
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-center text-gray-400 mt-3">
                                This is a simulated payment for demo purposes
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
