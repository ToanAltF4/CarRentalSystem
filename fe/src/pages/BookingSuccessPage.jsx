import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Calendar, Car, Mail, Phone, User, Copy, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '../utils/formatters';

const BookingSuccessPage = () => {
    const location = useLocation();
    const { booking, vehicle } = location.state || {};
    const [copied, setCopied] = useState(false);

    // Redirect if no booking data
    if (!booking) {
        return <Navigate to="/" replace />;
    }

    const handleCopyCode = () => {
        navigator.clipboard.writeText(booking.bookingCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-500">Your reservation has been successfully created</p>
                </div>

                {/* Booking Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Booking Code Header */}
                    <div className="bg-gradient-to-r from-primary to-green-500 px-6 py-4 text-white">
                        <p className="text-sm opacity-80 mb-1">Booking Code</p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold tracking-wide">{booking.bookingCode}</span>
                            <button
                                onClick={handleCopyCode}
                                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition-colors"
                            >
                                <Copy size={14} />
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                    src={vehicle?.imageUrl || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7'}
                                    alt={booking.vehicleName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{booking.vehicleName}</h3>
                                <p className="text-sm text-gray-500">Electric Vehicle</p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="px-6 py-4 space-y-3">
                        <div className="flex items-center gap-3 text-gray-600">
                            <User size={18} className="text-gray-400" />
                            <span>{booking.customerName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Mail size={18} className="text-gray-400" />
                            <span>{booking.customerEmail}</span>
                        </div>
                        {booking.customerPhone && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <Phone size={18} className="text-gray-400" />
                                <span>{booking.customerPhone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-gray-600">
                            <Calendar size={18} className="text-gray-400" />
                            <span>{booking.startDate} → {booking.endDate}</span>
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium">{booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Daily Rate</span>
                            <span className="font-medium">{formatPrice(booking.dailyRate)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total Amount</span>
                            <span className="text-xl font-bold text-primary">{formatPrice(booking.totalAmount)}</span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="px-6 py-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                                {booking.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                        to="/my-bookings"
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                    >
                        View My Bookings
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        to="/vehicles"
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        <Car size={18} />
                        Browse More Cars
                    </Link>
                </div>

                {/* Info Note */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>A confirmation email has been sent to <strong>{booking.customerEmail}</strong></p>
                    <p className="mt-1">Please keep your booking code safe for reference.</p>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccessPage;
