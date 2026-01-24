import { useState } from 'react';
import { Link } from 'react-router-dom';
import profileService from '../services/profileService';

const LICENSE_TYPES = [
    'PET license (fixed-term)',
    'PET license (no expiry)',
    'Legacy license (paper-based)'
];

const DriverLicenseUploadPage = () => {
    const [formData, setFormData] = useState({
        licenseType: LICENSE_TYPES[0],
        licenseNumber: '',
        dateOfBirth: '',
        frontImage: null
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, frontImage: file }));
        if (errors.frontImage) {
            setErrors((prev) => ({ ...prev, frontImage: '' }));
        }
        if (file) {
            const nextPreview = URL.createObjectURL(file);
            setPreviewUrl(nextPreview);
        } else {
            setPreviewUrl('');
        }
    };

    const validate = () => {
        const nextErrors = {};
        if (!formData.frontImage) {
            nextErrors.frontImage = 'Please upload the front image of your license.';
        }
        if (!formData.licenseNumber.trim()) {
            nextErrors.licenseNumber = 'Please enter your license number.';
        }
        if (!formData.dateOfBirth) {
            nextErrors.dateOfBirth = 'Please select your date of birth.';
        }
        return nextErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        setSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('licenseType', formData.licenseType);
            payload.append('licenseNumber', formData.licenseNumber);
            payload.append('dateOfBirth', formData.dateOfBirth);
            payload.append('frontImage', formData.frontImage);

            await profileService.updateDriverLicense(payload);
            setMessage('License details submitted. We will review them shortly.');
            setTimeout(() => setMessage(''), 2500);
        } catch (error) {
            console.error('Failed to upload license', error);
            setMessage('');
            setErrors({
                form: error.response?.data?.message || 'Failed to submit license details.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-10 md:px-6">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
                    <Link to="/profile" className="hover:text-primary">My Profile</Link>
                    <span>/</span>
                    <span className="font-medium text-gray-900">Driver License</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Driver License Update</h1>
                <p className="text-gray-500 mt-1">Upload the front image and enter your license details.</p>
            </div>

            {message && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                </div>
            )}
            {errors.form && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors.form}
                </div>
            )}

            <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div>
                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                            <p className="text-sm text-gray-600">
                                Upload a clear front image of your driver license.
                            </p>
                            <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                                Choose front image
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={submitting}
                                    onChange={handleFileChange}
                                />
                            </label>
                            {formData.frontImage && (
                                <p className="mt-3 text-xs text-gray-600">
                                    Selected: {formData.frontImage.name}
                                </p>
                            )}
                            {previewUrl && (
                                <div className="mt-4 flex justify-center">
                                    <img
                                        src={previewUrl}
                                        alt="License front preview"
                                        className="h-36 w-auto rounded-lg border border-gray-200 object-cover"
                                    />
                                </div>
                            )}
                            {errors.frontImage && (
                                <p className="mt-3 text-xs text-red-500">{errors.frontImage}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">License Type</label>
                            <select
                                name="licenseType"
                                value={formData.licenseType}
                                onChange={handleChange}
                                disabled={submitting}
                                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            >
                                {LICENSE_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">License Number</label>
                            <input
                                type="text"
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                disabled={submitting}
                                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                                placeholder="Enter license number"
                            />
                            {errors.licenseNumber && (
                                <p className="mt-2 text-xs text-red-500">{errors.licenseNumber}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                disabled={submitting}
                                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            />
                            {errors.dateOfBirth && (
                                <p className="mt-2 text-xs text-red-500">{errors.dateOfBirth}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black"
                    >
                        {submitting ? 'Submitting...' : 'Submit details'}
                    </button>
                    <Link
                        to="/profile"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                        Back to Profile
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default DriverLicenseUploadPage;
