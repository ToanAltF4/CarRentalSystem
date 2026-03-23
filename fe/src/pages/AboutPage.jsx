import React from 'react';
import { Shield, Zap, Heart, Users, Award, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">

            {/* Hero Section */}
            <div className="relative h-[60vh] bg-[#141414] text-white flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=2000"
                        alt="Electric Vehicle Fleet"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
                </div>

                <div className="container mx-auto px-6 z-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                        Pioneering <span className="text-[#5fcf86]">Green Mobility</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mb-8 leading-relaxed">
                        Leading the charge towards a sustainable future with Vietnam's premier 100% electric car rental service.
                    </p>
                </div>
            </div>

            {/* Who We Are */}
            <section className="py-20 container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="md:w-1/2">
                        <h5 className="text-[#5fcf86] font-bold text-sm tracking-widest uppercase mb-2">Who We Are</h5>
                        <h2 className="text-4xl font-bold mb-6 text-[#141414]">Not Just Another Rental Company</h2>
                        <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                            <p>
                                Founded in 2024, E-Fleet is Vietnam's first dedicated Electric Vehicle rental enterprise.
                                Unlike marketplace apps (P2P), <strong>we own 100% of our fleet</strong>.
                            </p>
                            <p>
                                This allows us to guarantee consistent 5-star quality, rigorous maintenance standards,
                                and uniform cleanliness for every single journey. We are building an ecosystem where
                                convenience meets sustainability.
                            </p>
                        </div>
                    </div>
                    <div className="md:w-1/2 grid grid-cols-2 gap-4">
                        <img className="rounded-2xl shadow-lg w-full h-64 object-cover -translate-y-8" src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800" alt="VinFast Fleet" />
                        <img className="rounded-2xl shadow-lg w-full h-64 object-cover translate-y-8" src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800" alt="Tesla Details" />
                    </div>
                </div>
            </section>

            {/* Why Us / Core Values */}
            <section className="bg-gray-50 py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#141414] mb-4">Why Choose E-Fleet?</h2>
                        <div className="w-20 h-1 bg-[#5fcf86] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Value 1 */}
                        <div className="text-center px-4">
                            <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-6 text-[#5fcf86]">
                                <Award size={40} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Premium Fleet</h3>
                            <p className="text-gray-500">
                                Experience the latest models from Tesla, VinFast, and Mercedes. All vehicles are under 2 years old and meticulously maintained.
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="text-center px-4">
                            <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-6 text-[#5fcf86]">
                                <Heart size={40} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Customer First</h3>
                            <p className="text-gray-500">
                                24/7 dedicated support, roadside assistance, and a seamless booking experience. Your safety and comfort are our top priority.
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="text-center px-4">
                            <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-6 text-[#5fcf86]">
                                <Globe size={40} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Sustainable Impact</h3>
                            <p className="text-gray-500">
                                Every kilometer you drive with E-Fleet contributes to reducing carbon emissions. Join us in creating a greener Vietnam.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 bg-[#141414] text-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-[#5fcf86] mb-2">500+</div>
                            <div className="text-gray-400 font-medium">Vehicles</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-[#5fcf86] mb-2">10k+</div>
                            <div className="text-gray-400 font-medium">Happy Customers</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-[#5fcf86] mb-2">50+</div>
                            <div className="text-gray-400 font-medium">Corporate Partners</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-[#5fcf86] mb-2">1M+</div>
                            <div className="text-gray-400 font-medium">Green Km Driven</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#141414]">Ready to embrace the future of mobility?</h2>
                    <p className="text-gray-500 mb-8 max-w-xl mx-auto">Discover the joy of driving electric. Quiet, powerful, and eco-friendly.</p>
                    <Link to="/vehicles" className="inline-block bg-[#5fcf86] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#4bc076] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                        Explore Our Fleet
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default AboutPage;
