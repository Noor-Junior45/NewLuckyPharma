import React from 'react';

const Services: React.FC = () => {
    return (
        // Start: Medical-50 -> Via: Blue-100 -> End: White
        <section id="services" className="py-16 scroll-mt-24 bg-gradient-to-b from-medical-50 via-blue-100 to-white">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <span className="text-[10px] bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 font-black px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-3 shadow-sm">
                        Our Expertise
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4 font-sans">
                        Complete Healthcare & Digital Services
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        Licensed retail chemist and government-registered digital health hub supporting our Hanwara community and neighboring Godda regional sectors with high-standard pharmaceuticals, clinical camps, and wellness provisions.
                    </p>
                </div>

                {/* 3x2 Grid on desktop, 2x3 on tablet, 1x6 on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    
                    {/* Card 1: Brand & Commitment Showcase (Image block) */}
                    <div className="group relative overflow-hidden rounded-3xl min-h-[320px] shadow-md border-4 border-white flex flex-col justify-end p-6 bg-gray-950">
                        <img 
                            src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                            alt="Pharmacy Care Shelf" 
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover opacity-50 transform transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent"></div>
                        <div className="relative z-10">
                            <span className="text-[9px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                                Hanwara Main Store
                            </span>
                            <h3 className="text-xl font-bold text-white mb-2">Committed to Wellness</h3>
                            <p className="text-gray-300 text-xs leading-relaxed">
                                Bringing licensed medicinal inventory, quality storage protocols, and digital health tools to your doorstep, backed by strict drug compliance standards.
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Prescription Fulfillment */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-medical-50 text-medical-600 flex items-center justify-center mb-5 border border-medical-100 group-hover:bg-medical-600 group-hover:text-white transition-colors duration-300">
                                <i className="fas fa-file-medical text-xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans group-hover:text-medical-600 transition-colors duration-300">
                                Prescription Fulfillment
                            </h3>
                            <p className="text-gray-650 text-xs leading-relaxed mb-4">
                                Accurately dispensed therapies managed directly by registered pharmacists. Full tracking of product batch codes, precise composition variables, and correct temperature-stored medications.
                            </p>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
                            <i className="fas fa-check-circle text-emerald-500"></i> Strict Retail Guidelines
                        </div>
                    </div>

                    {/* Card 3: Baby & Mother Care */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-5 border border-pink-100 group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300">
                                <i className="fas fa-baby text-xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans group-hover:text-pink-600 transition-colors duration-300">
                                Baby & Mother Care
                            </h3>
                            <p className="text-gray-650 text-xs leading-relaxed mb-4">
                                Complete inventory covering pre-natal and post-natal healthcare support. We stock specialized baby foods, pediatric multivitamin syrups, specialized sanitizers, and maternal health essentials.
                            </p>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
                            <i className="fas fa-baby-carriage text-pink-500"></i> Pure & Gentle Formulations
                        </div>
                    </div>

                    {/* Card 4: Homeopathic Remedies */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 border border-emerald-100 group-hover:bg-emerald-700 group-hover:text-white transition-colors duration-300">
                                <i className="fas fa-leaf text-xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans group-hover:text-emerald-700 transition-colors duration-300">
                                Homeopathic Solutions
                            </h3>
                            <p className="text-gray-650 text-xs leading-relaxed mb-4">
                                Authorized premium stockist for world-class homeopathic remedies. Offering pre-packaged dilutions, bio-chemic tablets, mother tinctures, and seasonal health granules from brands like SBL.
                            </p>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1.5">
                            <i className="fas fa-award text-emerald-500"></i> Authorized SBL Stockist
                        </div>
                    </div>

                    {/* Card 5: ABHA Card Generation */}
                    <div className="bg-emerald-50/10 backdrop-blur-sm p-6 rounded-3xl border-2 border-emerald-200/60 shadow-sm hover:shadow-lg hover:bg-emerald-50/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
                        <div>
                            <div className="flex items-center justify-between gap-2 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center border border-emerald-200 shadow-inner">
                                    <i className="fas fa-id-card text-xl"></i>
                                </div>
                                <span className="text-[8px] sm:text-[9px] bg-orange-100 border border-orange-200 text-orange-850 font-black px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                    NHA Registered
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-emerald-900 mb-2 font-sans flex items-center gap-1.5">
                                ABHA ID Generation
                            </h3>
                            <p className="text-gray-650 text-xs leading-relaxed mb-4">
                                Registered as an authorized <strong className="text-emerald-800">Digital Health Facility (Healthcare Facility Registry)</strong> under the <strong className="text-gray-800 font-medium">Ayushman Bharat Digital Mission (ABDM)</strong>. Legally set up cards directly representing Godda licensing criteria.
                            </p>
                            <p className="text-gray-600 text-[11px] leading-relaxed mb-3">
                                Visit our store in <strong className="text-emerald-800 font-semibold">Hanwara</strong> with your smartphone and Aadhaar. Get your 14-digit secure <strong>ABHA Card</strong> generated free of charge to safely store lab reports, digital treatments, and prescriptions nationwide!
                            </p>
                        </div>
                        <div className="text-[9px] text-emerald-850 font-bold font-mono bg-emerald-100/80 p-2 rounded-xl border border-emerald-200/50 flex flex-col gap-0.5">
                            <span>Facility HFR Code: IN2010014663</span>
                            <span className="text-gray-400 font-normal">Verified on June 04, 2026 (Govt of India Agency)</span>
                        </div>
                    </div>

                    {/* Card 6: Sunday Clinical Consultation Camp */}
                    <div className="bg-orange-50/15 backdrop-blur-sm p-6 rounded-3xl border-2 border-orange-200/60 shadow-sm hover:shadow-lg hover:bg-orange-50/35 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
                        <div>
                            <div className="flex items-center justify-between gap-2 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100/90 text-orange-700 flex items-center justify-center border border-orange-200 shadow-inner">
                                    <i className="fas fa-stethoscope text-xl"></i>
                                </div>
                                <span className="text-[8px] sm:text-[9px] bg-emerald-150 border border-emerald-250 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                    Sunday Special
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-orange-950 mb-2 font-sans">
                                Sunday Specialist Camps
                            </h3>
                            <p className="text-gray-650 text-xs leading-relaxed mb-3">
                                Every Sunday, our Hanwara store hosts trusted visiting physicians and clinicians! Depending on weekly hospital availability and schedules, our camps feature:
                            </p>
                            <ul className="text-gray-600 text-[11px] space-y-1 mb-4 border-l-2 border-orange-200 pl-2 lg:pl-3">
                                <li>• MBBS General Physicians for primary checks</li>
                                <li>• Orthopedic specialists (Bone & Joint Care)</li>
                                <li>• Experienced OPD clinicians for consultation</li>
                            </ul>
                            <p className="text-[10px] text-gray-500 leading-relaxed italic mb-3">
                                *Note: Speciality scheduling varies weekly. To ensure reliable continuum of care, we provide complete doctor details & clinic/hospital directory coordinates so you can seamlessly visit their main clinical hospitals for advanced evaluations.
                            </p>
                        </div>
                        <div className="text-[9px] text-orange-850 font-bold font-mono bg-orange-100/80 p-2 rounded-xl border border-orange-150 flex items-center gap-1.5">
                            <i className="fas fa-clock text-orange-600 animate-spin" style={{ animationDuration: '6s' }}></i> Variable Sunday Rosters
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Services;
