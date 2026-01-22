import { Zap, Fuel, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 border border-gray-100">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={car.image}
                    alt={car.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-sm">
                    Electric
                </div>
                {car.isNew && (
                    <div className="absolute top-3 right-3 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                        New
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{car.name}</h3>
                        <p className="text-xs text-gray-500">{car.brand} • {car.year}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-md bg-yellow-50 px-1.5 py-0.5 text-xs font-medium text-yellow-700">
                        <Star size={12} className="fill-yellow-500 text-yellow-500" />
                        <span>{car.rating}</span>
                    </div>
                </div>

                {/* Features */}
                <div className="mb-4 mt-auto flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Zap size={14} className="text-primary" />
                        <span>{car.range}km</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Fuel size={14} className="text-blue-500" />
                        <span>Ev</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">Auto</span>
                    </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Daily Rate</span>
                        <span className="text-lg font-bold text-primary">
                            ${car.price}
                            <span className="text-xs font-normal text-gray-400">/day</span>
                        </span>
                    </div>
                    <Link
                        to={`/vehicles/${car.id}`}
                        className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                    >
                        Book
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CarCard;
