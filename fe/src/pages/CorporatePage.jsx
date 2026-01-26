import React, { useState } from 'react';
import { Briefcase, TrendingUp, Headphones, Car, Shield, Leaf, Send, Check } from 'lucide-react';

const CorporatePage = () => {
    const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success

    const handleQuoteSubmit = (e) => {
        e.preventDefault();
        setFormStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            setFormStatus('success');
            // Check form reset logic if needed, but for static page demo 'success' state is enough
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800">

            {/* Hero Section */}
            <header className="relative bg-[#141414] text-white overflow-hidden h-[500px] flex items-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2070"
                        alt="Corporate EV Fleet"
                        className="w-full h-full object-cover opacity-40 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent"></div>
                </div>

                <div className="container mx-auto px-6 z-10 relative">
                    <div className="max-w-2xl animate-fade-in-up">
                        <span className="inline-block py-1 px-3 rounded-full bg-[#5fcf86]/20 text-[#5fcf86] text-sm font-bold mb-4 border border-[#5fcf86]/30">
                            B2B SOLUTIONS
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Green Mobility <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5fcf86] to-emerald-400">For Your Business</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                            Elevate your corporate image and reduce costs with E-Fleet's premium electric vehicle leasing solutions.
                        </p>
                        <a href="#contact-form" className="inline-flex items-center gap-2 bg-[#5fcf86] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#4bc076] transition-all shadow-lg hover:shadow-[#5fcf86]/30">
                            Get a Corporate Quote <TrendingUp size={18} />
                        </a>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-20">

                {/* 1. Why Choose E-Fleet (Benefits) */}
                <section className="mb-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#141414] mb-4">Why Partner with E-Fleet?</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">We provide more than just cars; we provide a complete transportation ecosystem for your company.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Benefit 1 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300 group">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#5fcf86] transition-colors">
                                <TrendingUp size={32} className="text-[#5fcf86] group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#141414] mb-3">Cost Optimization</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Save up to 30% on operational costs compared to owning a fleet. No maintenance fees, depreciation worries, or hidden insurance costs. Full VAT invoices provided.
                            </p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300 group">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#5fcf86] transition-colors">
                                <Leaf size={32} className="text-blue-500 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#141414] mb-3">Eco-Friendly Brand</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Demonstrate your commitment to sustainability (ESG). Use our modern electric fleet to enhance your brand image with clients and partners.
                            </p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300 group">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#5fcf86] transition-colors">
                                <Headphones size={32} className="text-purple-500 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#141414] mb-3">24/7 Priority Support</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Dedicated account manager for your business. 24/7 roadside assistance and immediate car replacement in case of issues.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. Service Options */}
                <section className="mb-24">
                    <div className="bg-[#1f2937] rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#5fcf86]/10 rounded-full blur-3xl"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Tailored Corporate Services</h2>
                                <p className="text-gray-400 mb-8 text-lg">Whether you need a full fleet for your sales team or a luxury ride for your CEO, we have a flexible solution.</p>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-10 h-10 bg-[#5fcf86]/20 rounded-full flex items-center justify-center text-[#5fcf86]">
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-1">Long-term Leasing</h4>
                                            <p className="text-sm text-gray-400">Monthly or yearly contracts with flexible terms. Scale your fleet up or down as needed.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-10 h-10 bg-[#5fcf86]/20 rounded-full flex items-center justify-center text-[#5fcf86]">
                                            <Car size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-1">Employee Transportation</h4>
                                            <p className="text-sm text-gray-400">Fixed-route shuttle services or car allowances for senior management.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-10 h-10 bg-[#5fcf86]/20 rounded-full flex items-center justify-center text-[#5fcf86]">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-1">Event VIP Service</h4>
                                            <p className="text-sm text-gray-400">Premium chauffeur services for corporate events, airport transfers, and VIP clients.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                                <img
                                    src="https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=1500"
                                    alt="Corporate Service"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                                    <p className="font-bold text-lg">Premium Fleet</p>
                                    <p className="text-xs text-gray-400">Top-tier EVs (Tesla, VF9, BMW)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Contact Form */}
                <section id="contact-form" className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                        <div className="md:w-1/3 bg-[#5fcf86] p-8 text-white flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Let's Talk</h3>
                                <p className="text-white/80 text-sm mb-6">Fill out the form and our B2B specialized team will get back to you within 2 hours.</p>
                            </div>
                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex items-center gap-3"><Send size={16} /> sales@efleet.vn</div>
                                <div className="flex items-center gap-3"><Briefcase size={16} /> +84 90 123 4567</div>
                            </div>
                        </div>

                        <div className="md:w-2/3 p-8 md:p-12">
                            {formStatus === 'success' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                        <Check size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                                    <p className="text-gray-500">Thank you for your interest. We will contact you shortly.</p>
                                    <button onClick={() => setFormStatus('idle')} className="mt-6 text-[#5fcf86] font-semibold hover:underline">Send another request</button>
                                </div>
                            ) : (
                                <form onSubmit={handleQuoteSubmit} className="space-y-6">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Request a Quote</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Company Name</label>
                                            <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5fcf86] focus:ring-1 focus:ring-[#5fcf86] outline-none transition-all" placeholder="e.g. Acme Corp" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contact Person</label>
                                            <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5fcf86] focus:ring-1 focus:ring-[#5fcf86] outline-none transition-all" placeholder="Your Name" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Work Email</label>
                                            <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5fcf86] focus:ring-1 focus:ring-[#5fcf86] outline-none transition-all" placeholder="you@company.com" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fleet Size Needed</label>
                                            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5fcf86] focus:ring-1 focus:ring-[#5fcf86] outline-none transition-all bg-white">
                                                <option>1-5 Vehicles</option>
                                                <option>5-20 Vehicles</option>
                                                <option>20-50 Vehicles</option>
                                                <option>50+ Vehicles</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message / Requirements</label>
                                        <textarea rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5fcf86] focus:ring-1 focus:ring-[#5fcf86] outline-none transition-all" placeholder="Tell us about your needs..."></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={formStatus === 'submitting'}
                                        className="w-full bg-[#141414] text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-wait"
                                    >
                                        {formStatus === 'submitting' ? 'Sending...' : 'Submit Request'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default CorporatePage;
