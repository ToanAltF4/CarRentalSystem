import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VnpayReturnPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const message = params.get('message');
    const invoiceNumber = params.get('invoiceNumber');
    const paymentStatus = params.get('paymentStatus');

    const isSuccess = code === '00';

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                navigate('/my-bookings');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, navigate]);

    return (
        <div className="container mx-auto px-4 py-16 md:px-6">
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                {code ? (
                    <>
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                            {isSuccess ? (
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            ) : (
                                <XCircle className="w-8 h-8 text-red-500" />
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {isSuccess ? 'Payment Successful' : 'Payment Failed'}
                        </h1>
                        <p className="text-gray-500 mb-4">{message || 'Payment response received.'}</p>

                        <div className="text-sm text-gray-600 space-y-1 mb-6">
                            {invoiceNumber && <div>Booking/Invoice: <span className="font-mono">{invoiceNumber}</span></div>}
                            {paymentStatus && <div>Status: <span className="font-semibold">{paymentStatus}</span></div>}
                        </div>

                        {isSuccess ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Redirecting to My Bookings...
                            </div>
                        ) : (
                            <Link
                                to="/my-bookings"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
                            >
                                Back to My Bookings
                            </Link>
                        )}
                    </>
                ) : (
                    <>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h1>
                        <p className="text-gray-500">Please wait while we confirm your payment.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default VnpayReturnPage;
