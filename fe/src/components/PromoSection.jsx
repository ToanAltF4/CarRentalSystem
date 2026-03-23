import { Shield, BadgeCheck, Headphones, Wallet, Clock, ThumbsUp } from 'lucide-react';

const PromoSection = () => {
    const features = [
        {
            icon: Shield,
            title: 'Maximum Safety',
            description: 'Vehicles fully insured with comprehensive coverage'
        },
        {
            icon: BadgeCheck,
            title: 'Verified Hosts',
            description: '100% of hosts and vehicle information are verified'
        },
        {
            icon: Headphones,
            title: '24/7 Support',
            description: 'Dedicated customer support team always ready to help'
        },
        {
            icon: Wallet,
            title: 'Best Prices',
            description: 'Competitive rates, no hidden fees, transparent pricing'
        },
        {
            icon: Clock,
            title: 'Simple Process',
            description: 'Book in 2 minutes, instant confirmation'
        },
        {
            icon: ThumbsUp,
            title: 'Great Experience',
            description: 'Over 100,000+ satisfied customers nationwide'
        }
    ];

    return (
        <section className="py-16 bg-[#f6f6f6]">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#141414] mb-4">
                        Why Choose E-Fleet?
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Best-in-class features for your peace of mind
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
                        >
                            <div className="w-14 h-14 bg-[#5fcf86]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#5fcf86] transition-colors">
                                <feature.icon size={28} className="text-[#5fcf86] group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-[#141414] mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PromoSection;
