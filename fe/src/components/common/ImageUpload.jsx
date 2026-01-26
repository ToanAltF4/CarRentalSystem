import { useState } from 'react';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

/**
 * Image Upload Component
 * Uses server-side upload to Cloudflare R2
 */
const ImageUpload = ({ onUploadSuccess, folder = 'vehicles' }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Chỉ chấp nhận file ảnh');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File vượt quá 10MB');
            return;
        }

        // Preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setUploading(true);
        setError(null);
        setProgress(0);

        // Prepare FormData
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Upload to backend -> R2
            const response = await api.post(`/v1/upload/${folder}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percent);
                }
            });

            const url = response.data.url;
            setUploadedUrl(url);
            setUploading(false);
            onUploadSuccess(url);

        } catch (err) {
            console.error('Upload failed:', err);
            const msg = err.response?.data?.error || err.message || 'Upload failed';
            setError(`Lỗi: ${msg}`);
            setUploading(false);
        }
    };

    const removeImage = () => {
        setPreview(null);
        setUploadedUrl(null);
        setError(null);
        setProgress(0);
        onUploadSuccess('');
    };

    const retryUpload = () => {
        setPreview(null);
        setError(null);
        setProgress(0);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình ảnh xe
            </label>

            {!preview ? (
                // Upload Zone
                <div className="relative flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#5fcf86] transition-all">
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                        <div className="w-14 h-14 rounded-full bg-[#5fcf86]/10 flex items-center justify-center">
                            <Upload size={24} className="text-[#5fcf86]" />
                        </div>
                        <span className="text-sm font-medium">Nhấn để tải ảnh lên</span>
                        <span className="text-xs text-gray-400">PNG, JPG tối đa 10MB</span>
                    </div>
                </div>
            ) : (
                // Preview Zone
                <div className="relative min-h-[200px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                    />

                    {/* Remove Button */}
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 rounded-full bg-white p-2 text-red-500 hover:bg-red-50 shadow-lg transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {/* Uploading Overlay */}
                    {uploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                            <Loader2 size={36} className="animate-spin text-[#5fcf86] mb-3" />
                            <span className="text-sm font-semibold text-gray-700">Đang tải lên...</span>
                            <div className="w-48 h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                                <div
                                    className="h-full bg-[#5fcf86] rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{progress}%</span>
                        </div>
                    )}

                    {/* Success Overlay */}
                    {!uploading && uploadedUrl && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <div className="flex items-center gap-2 text-white">
                                <CheckCircle size={18} className="text-green-400" />
                                <span className="text-sm font-medium">Tải lên thành công!</span>
                            </div>
                        </div>
                    )}

                    {/* Error Overlay */}
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95">
                            <AlertCircle size={36} className="text-red-500 mb-3" />
                            <span className="text-sm font-semibold text-red-600 text-center px-4">{error}</span>
                            <button
                                onClick={retryUpload}
                                className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
