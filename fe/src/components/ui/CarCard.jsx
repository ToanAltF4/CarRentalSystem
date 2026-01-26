import { Link } from 'react-router-dom';
import { Star, MapPin, Zap, Truck } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

const CarCard = ({ car }) => {
    // Default values for missing data
    const {
        id,
        name = 'Unknown Vehicle',
        imageUrl = 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800',
        dailyRate = 0,
        rating = 5.0,
        trips = 0,
        location = 'Quận 1, TP.HCM',
        discount = null,
        delivery = true,
        isElectric = true,
        brand = '',
        model = '',
        year = 2024
    } = car || {};



    // Generate display name
    const displayName = name || `${brand} ${model} ${year}`.trim();

    return (
        <Link
            to={`/vehicles/${id}`}
            className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={imageUrl}
                    alt={displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Discount Badge - Top Left */}
                {discount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                        Giảm {discount}%
                    </div>
                )}

                {/* Electric Badge - Top Right */}
                {isElectric && (
                    <div className="absolute top-3 right-3 bg-[#5fcf86] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1">
                        <Zap size={12} />
                        Điện
                    </div>
                )}

                {/* Delivery Badge - Bottom Right */}
                {delivery && (
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-[#5fcf86] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                        <Truck size={14} />
                        Giao xe tận nơi
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="p-4">
                {/* Car Name */}
                <h3 className="text-base font-bold text-[#141414] uppercase tracking-wide mb-2 line-clamp-1 group-hover:text-[#5fcf86] transition-colors">
                    {displayName}
                </h3>

                {/* Rating & Trips */}
                <div className="flex items-center gap-2 text-sm mb-3">
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={14} fill="currentColor" strokeWidth={0} />
                        <span className="font-semibold text-[#141414]">{rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{trips} chuyến</span>
                </div>

                {/* Price & Location */}
                <div className="flex items-end justify-between mt-auto pt-2 border-t border-gray-100">
                    {/* Location */}
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <MapPin size={12} />
                        <span className="line-clamp-1">{location}</span>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                        <span className="text-lg font-bold text-[#5fcf86]">{formatPrice(dailyRate)}</span>
                        <span className="text-gray-400 text-xs">/ngày</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CarCard;
