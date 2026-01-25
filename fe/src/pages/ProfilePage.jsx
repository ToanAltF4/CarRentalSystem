import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import profileService from '../services/profileService';

const PHONE_REGEX = /^\+?[0-9]{9,15}$/;

const getDefaultProfile = (user) => ({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: '',
    accountStatus: 'ACTIVE',
    licenseStatus: 'NONE',
    licenseType: '',
    licenseNumber: '',
    dateOfBirth: '',
    licenseFrontImageUrl: ''
});

const statusBadgeStyles = {
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-gray-100 text-gray-600',
    BANNED: 'bg-red-100 text-red-700'
};

const licenseBadgeStyles = {
    NONE: 'bg-gray-100 text-gray-600',
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700'
};

const ProfilePage = () => {
    const user = authService.getCurrentUser();
    const [profile, setProfile] = useState(() => getDefaultProfile(user));
    const [draft, setDraft] = useState(() => getDefaultProfile(user));
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            setLoading(true);
            setLoadError('');
            try {
                const data = await profileService.getProfile();
                if (!isMounted) return;
                    const nextProfile = {
                        ...getDefaultProfile(user),
                        ...data,
                        email: data.email || user?.email || '',
                        fullName: data.fullName || user?.fullName || ''
                    };
                setProfile(nextProfile);
                setDraft(nextProfile);
            } catch (error) {
                console.error('Failed to load profile data', error);
                if (isMounted) {
                    setLoadError(error.response?.data?.message || 'Failed to load profile.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [user?.email, user?.fullName]);

    const handleEdit = () => {
        setDraft(profile);
        setErrors({});
        setIsEditing(true);
    };

    const handleCancel = () => {
        setDraft(profile);
        setErrors({});
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDraft((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const nextErrors = {};
        if (draft.phoneNumber && !PHONE_REGEX.test(draft.phoneNumber)) {
            nextErrors.phoneNumber = 'Phone must be 9-15 digits, optional leading +';
        }
        return nextErrors;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        try {
            const updated = await profileService.updateProfile({
                fullName: draft.fullName,
                phoneNumber: draft.phoneNumber
            });
            const nextProfile = {
                ...profile,
                ...updated,
                email: updated.email || profile.email
            };
            setProfile(nextProfile);
            setDraft(nextProfile);
            if (nextProfile.fullName) {
                localStorage.setItem('userName', nextProfile.fullName);
            }
            setIsEditing(false);
            setMessage('Profile updated successfully.');
            setTimeout(() => setMessage(''), 2500);
        } catch (error) {
            console.error('Failed to update profile', error);
            setLoadError(error.response?.data?.message || 'Failed to update profile.');
        }
    };

    const licenseActionLabel = 'Upload / Update Driver License';
    const showRejectedMessage = profile.licenseStatus === 'REJECTED';

    return (
        <div className="container mx-auto px-4 py-10 md:px-6">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
                    <span className="font-medium text-gray-900">My Profile</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Profile</h1>
                <p className="text-gray-500 mt-1">Manage your personal information and license status.</p>
            </div>

            {message && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                </div>
            )}
            {loadError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {loadError}
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
                            <p className="text-sm text-gray-500">Keep your profile up to date for smooth rentals.</p>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSave} className="mt-6 grid gap-5">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={draft.fullName}
                                onChange={handleChange}
                                disabled={!isEditing || loading}
                                className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm outline-none transition ${isEditing ? 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30' : 'border-gray-100 bg-gray-50 text-gray-600'}`}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Email (readonly)</label>
                            <input
                                type="email"
                                name="email"
                                value={draft.email}
                                readOnly
                                className="mt-2 w-full cursor-not-allowed rounded-lg border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={draft.phoneNumber}
                                onChange={handleChange}
                                disabled={!isEditing || loading}
                                className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm outline-none transition ${isEditing ? 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30' : 'border-gray-100 bg-gray-50 text-gray-600'}`}
                                placeholder="+84901234567"
                            />
                            {errors.phoneNumber && (
                                <p className="mt-2 text-xs text-red-500">{errors.phoneNumber}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Account Status</span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles[profile.accountStatus] || 'bg-gray-100 text-gray-600'}`}>
                                    {profile.accountStatus}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Driver License Status</span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${licenseBadgeStyles[profile.licenseStatus] || 'bg-gray-100 text-gray-600'}`}>
                                    {profile.licenseStatus}
                                </span>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900">Driver License</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Upload your driver license to speed up approvals and rentals.
                    </p>

                    {showRejectedMessage && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            Your previous driver license was rejected. Please upload a clearer photo to continue.
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Current Status</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${licenseBadgeStyles[profile.licenseStatus] || 'bg-gray-100 text-gray-600'}`}>
                                {profile.licenseStatus}
                            </span>
                        </div>
                        <p>
                            {profile.licenseStatus === 'NONE' && 'No license on file. Upload now to unlock rentals.'}
                            {profile.licenseStatus === 'PENDING' && 'Your upload is under review.'}
                            {profile.licenseStatus === 'APPROVED' && 'Your license is approved.'}
                            {profile.licenseStatus === 'REJECTED' && 'Please upload a new photo.'}
                        </p>
                        {(profile.licenseType || profile.licenseNumber || profile.dateOfBirth) && (
                            <div className="space-y-2 text-sm text-gray-700">
                                {profile.licenseType && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">License Type</span>
                                        <span className="font-medium">{profile.licenseType}</span>
                                    </div>
                                )}
                                {profile.licenseNumber && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">License Number</span>
                                        <span className="font-medium">{profile.licenseNumber}</span>
                                    </div>
                                )}
                                {profile.dateOfBirth && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Date of Birth</span>
                                        <span className="font-medium">{profile.dateOfBirth}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {profile.licenseFrontImageUrl && (
                            <div className="pt-2">
                                <p className="text-xs font-semibold text-gray-500 mb-2">Front Image</p>
                                <img
                                    src={profile.licenseFrontImageUrl}
                                    alt="Driver license front"
                                    className="w-full max-w-[260px] rounded-lg border border-gray-200 object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <Link
                        to="/driver-license"
                        className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                    >
                        {licenseActionLabel}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
