import { useState, useEffect } from 'react';
import {
    RefreshCcw, Search, CheckCircle, XCircle,
    CreditCard, ExternalLink
} from 'lucide-react';
import operatorService from '../../services/operatorService';

const OperatorLicenseReview = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchPendingLicenses();
    }, []);

    const fetchPendingLicenses = async () => {
        setLoading(true);
        try {
            const data = await operatorService.getPendingLicenses();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching licenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await operatorService.approveLicense(userId);
            // Optimistic update
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Failed to approve:', error);
            alert('Failed to approve license');
        }
    };

    const handleReject = async (userId) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        try {
            await operatorService.rejectLicense(userId, reason);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Failed to reject:', error);
            alert('Failed to reject license');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">License Verification</h1>
                        <p className="text-gray-500">Review and verify driver licenses</p>
                    </div>
                    <button
                        onClick={fetchPendingLicenses}
                        className="p-2 text-gray-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCcw size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            Loading pending licenses...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl border border-gray-200 border-dashed">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
                            <p className="text-gray-500">No pending license verifications at the moment.</p>
                        </div>
                    ) : (
                        users.map(user => (
                            <div key={user.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                                {/* License Image Preview */}
                                <div
                                    className="h-48 bg-gray-100 relative group cursor-pointer overflow-hidden"
                                    onClick={() => setSelectedImage(user.licenseFrontImageUrl)}
                                >
                                    {user.licenseFrontImageUrl ? (
                                        <img
                                            src={user.licenseFrontImageUrl}
                                            alt={`License of ${user.fullName}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <CreditCard size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                                            <ExternalLink size={12} /> View Full
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-gray-900 text-lg">{user.fullName}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                        <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                                    </div>

                                    <div className="space-y-2 mb-6 text-sm">
                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                            <span className="text-gray-500">License Number</span>
                                            <span className="font-medium text-gray-900">{user.licenseNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                            <span className="text-gray-500">License Type</span>
                                            <span className="font-medium text-gray-900">{user.licenseType || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                            <span className="text-gray-500">Date of Birth</span>
                                            <span className="font-medium text-gray-900">{user.dateOfBirth || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <button
                                            onClick={() => handleReject(user.id)}
                                            className="py-2.5 px-4 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={18} /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(user.id)}
                                            className="py-2.5 px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} /> Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="License Full View"
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                    />
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                        onClick={() => setSelectedImage(null)}
                    >
                        <XCircle size={32} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default OperatorLicenseReview;
