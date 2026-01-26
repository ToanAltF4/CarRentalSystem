import React, { useState } from 'react';
import { DollarSign, Shield, Info, Clock, CheckCircle, HelpCircle, Truck, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
    // Accordion State for FAQ
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "Do I need to pay a deposit?",
            answer: "Yes, a security deposit of 15,000,000 VND is required. This will be fully refunded within 3 business days after the car is returned in good condition."
        },
        {
            question: "Is charging free?",
            answer: "We provide the car with at least 80% charge. You are responsible for charging costs during your rental at public stations (e.g., VinFast stations). Please return the car with at least 20% battery to avoid surcharges."
        },
        {
            question: "What documents are required?",
            answer: "You need a valid Driver's License (Class B1/B2 or higher), a national ID (CCCD), and a credit card for the deposit."
        },
        {
            question: "Does the price include insurance?",
            answer: "Basic insurance is included. However, we strongly recommend the Collision Damage Waiver (CDW) add-on for 150k/day for peace of mind."
        }
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800">
            {/* Hero Banner */}
            <div className="bg-[#141414] text-white py-16 px-4 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#5fcf86]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 container mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing & Rental Policies</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Transparent pricing with no hidden fees. Choose the perfect EV for your journey.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 space-y-16">

                {/* 1. Vehicle Class Pricing Table */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <DollarSign className="text-[#5fcf86]" size={28} />
                        <h2 className="text-3xl font-bold text-[#141414]">Vehicle Class Pricing</h2>
                    </div>

                    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
                        <table className="w-full min-w-[600px] text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="p-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Models</th>
                                    <th className="p-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Daily Rate (Est.)</th>
                                    <th className="p-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Ideal For</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6 font-bold text-[#141414] text-lg">Compact</td>
                                    <td className="p-6 text-gray-600">VinFast VF5</td>
                                    <td className="p-6 text-[#5fcf86] font-bold text-xl">800,000 VND</td>
                                    <td className="p-6 text-gray-500 text-sm">City commuting, solo travelers</td>
                                </tr>
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6 font-bold text-[#141414] text-lg">Sedan</td>
                                    <td className="p-6 text-gray-600">VinFast VF8, Tesla Model 3</td>
                                    <td className="p-6 text-[#5fcf86] font-bold text-xl">1,500,000 VND</td>
                                    <td className="p-6 text-gray-500 text-sm">Small families, budget trips</td>
                                </tr>
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6 font-bold text-[#141414] text-lg">Luxury</td>
                                    <td className="p-6 text-gray-600">VinFast VF9, Tesla Model S</td>
                                    <td className="p-6 text-[#5fcf86] font-bold text-xl">2,500,000 VND</td>
                                    <td className="p-6 text-gray-500 text-sm">Business, VIP experience</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 2. Additional Fees Breakdown */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <Info className="text-[#5fcf86]" size={28} />
                        <h2 className="text-3xl font-bold text-[#141414]">Additional Fees & Services</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Insurance */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Insurance CDW</h3>
                            <p className="text-3xl font-bold text-[#141414] mb-2">150k<span className="text-sm font-normal text-gray-400">/day</span></p>
                            <p className="text-sm text-gray-500">Collision Damage Waiver. Reduces your liability to zero in case of accidents.</p>
                        </div>

                        {/* Delivery */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-green-50 text-[#5fcf86] rounded-xl flex items-center justify-center mb-4">
                                <Truck size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Delivery Fee</h3>
                            <p className="text-3xl font-bold text-[#141414] mb-2">Free<span className="text-sm font-normal text-gray-400"> &lt; 5km</span></p>
                            <p className="text-sm text-gray-500">15k/km for further distances. We deliver the car to your doorstep.</p>
                        </div>

                        {/* Overtime */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                                <Clock size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Overtime Penalty</h3>
                            <p className="text-3xl font-bold text-[#141414] mb-2">100k<span className="text-sm font-normal text-gray-400">/hour</span></p>
                            <p className="text-sm text-gray-500">Grace period of 30 mins. Charged per hour if returned late.</p>
                        </div>

                        {/* Cleaning */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Cleaning Fee</h3>
                            <p className="text-3xl font-bold text-[#141414] mb-2">200k</p>
                            <p className="text-sm text-gray-500">Only charged if the car is returned excessively dirty or with odors (smoking/pets).</p>
                        </div>
                    </div>
                </section>

                {/* 3. FAQ Section */}
                <section className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-8 justify-center">
                        <HelpCircle className="text-[#5fcf86]" size={28} />
                        <h2 className="text-3xl font-bold text-[#141414]">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((item, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                                >
                                    <span>{item.question}</span>
                                    <span className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                {openFaq === index && (
                                    <div className="p-5 pt-0 text-gray-600 border-t border-gray-100 bg-gray-50/50 leading-relaxed">
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-[#141414] to-[#2d2d2d] rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
                    <h2 className="text-3xl font-bold mb-4">Ready to hit the road?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">Get the best rates on premium electric vehicles today.</p>
                    <Link to="/vehicles" className="inline-block bg-[#5fcf86] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#4bc076] transition-all transform hover:scale-105 shadow-glow">
                        Book a Car Now
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default PricingPage;
