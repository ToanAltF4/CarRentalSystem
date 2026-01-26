import { Shield, BadgeCheck, Headphones, Wallet, Clock, ThumbsUp } from 'lucide-react';

const PromoSection = () => {
    const features = [
        {
            icon: Shield,
            title: 'An toàn tối đa',
            description: 'Xe được trang bị bảo hiểm vật chất và mọi vấn đề pháp lý'
        },
        {
            icon: BadgeCheck,
            title: 'Chủ xe uy tín',
            description: '100% chủ xe được xác minh danh tính và thông tin xe'
        },
        {
            icon: Headphones,
            title: 'Hỗ trợ 24/7',
            description: 'Đội ngũ hỗ trợ khách hàng nhiệt tình và nhanh chóng'
        },
        {
            icon: Wallet,
            title: 'Giá tốt nhất',
            description: 'Giá thuê xe cạnh tranh, không phí ẩn, minh bạch rõ ràng'
        },
        {
            icon: Clock,
            title: 'Thủ tục đơn giản',
            description: 'Đặt xe chỉ 2 phút, nhận xe ngay không cần chờ đợi'
        },
        {
            icon: ThumbsUp,
            title: 'Trải nghiệm tốt',
            description: 'Hơn 100,000+ khách hàng hài lòng trên toàn quốc'
        }
    ];

    return (
        <section className="py-16 bg-[#f6f6f6]">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#141414] mb-4">
                        Ưu điểm của Mioto
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Những tính năng giúp bạn an tâm thuê xe và tận hưởng chuyến đi
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
