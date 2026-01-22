import { useState } from 'react';
import axios from 'axios';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);

    // TODO: Replace with your actual Cloudinary credentials
    const CLOUD_NAME = "da89i9ecm";
    const UPLOAD_PRESET = "CarImage";

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview immediate
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                formData
            );

            const secureUrl = res.data.secure_url;
            onUploadSuccess(secureUrl);
            setUploading(false);
        } catch (err) {
            console.error("Upload failed", err);
            const msg = err.response?.data?.error?.message || err.message || "Upload failed";
            setError(`Upload failed: ${msg}`);
            setUploading(false);
        }
    };

    const removeImage = () => {
        setPreview(null);
        onUploadSuccess(""); // clear in parent
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Image</label>

            {!preview ? (
                <div className="relative flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Upload size={32} />
                        <span className="text-sm font-medium">Click to upload image</span>
                        <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
                    </div>
                </div>
            ) : (
                <div className="relative min-h-[200px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                    />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                        <button
                            type="button"
                            onClick={removeImage}
                            className="rounded-full bg-white p-2 text-red-500 hover:bg-red-50"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Status Indicator */}
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2 text-primary">
                                <Loader2 size={32} className="animate-spin" />
                                <span className="text-sm font-bold">Uploading...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90">
                            <div className="flex flex-col items-center gap-2 text-red-500">
                                <X size={32} />
                                <span className="text-sm font-bold">{error}</span>
                                <button onClick={() => setPreview(null)} className="text-xs underline">Try again</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
