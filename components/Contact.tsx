import React from 'react';

const Contact: React.FC = () => {
    return (
        // Start: White (Matches FAQ End) -> Fade In: Medical-100 -> Fade Out: Medical-50/White
        <section id="contact" className="py-20 scroll-mt-24 bg-gradient-to-b from-white via-medical-100 to-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 reveal">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Visit Us Today</h2>
                    <p className="text-lg text-gray-700 mb-6 font-medium">We are open every day to serve your healthcare needs.</p>
                    
                    <div className="inline-block bg-orange-50 px-6 py-3 rounded-full border border-orange-100 shadow-sm text-gray-600 text-sm animate-fade-in">
                        <i className="fas fa-info-circle text-orange-500 mr-2 text-lg"></i>
                        <span className="font-bold text-gray-800">Note:</span> We do not provide home delivery. Please visit our store for all purchases.
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Box 1: Contact Info */}
                    <div className="reveal bg-gradient-to-br from-white to-medical-50 backdrop-blur-md border border-medical-100 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative z-10 animate-fade-in-up shadow-xl hover:shadow-2xl hover:shadow-medical-500/20 group">
                        <div className="absolute inset-0 bg-medical-600/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-medical-600 shadow-md border border-medical-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                <i className="fas fa-headset text-3xl"></i>
                            </div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Contact Us</h3>
                            <ul className="space-y-5">
                                <li className="flex items-center group/item cursor-pointer bg-white p-3 rounded-2xl border border-gray-100 hover:border-medical-300 hover:shadow-md transition-all duration-300">
                                    <span className="w-12 h-12 rounded-xl bg-medical-50 flex items-center justify-center mr-4 transition-colors duration-300 group-hover/item:bg-medical-600 group-hover/item:text-white text-medical-600">
                                        <i className="fas fa-phone-alt text-xl"></i>
                                    </span>
                                    <a href="tel:+919798881368" className="text-lg font-bold text-gray-800 hover:text-medical-600 transition-colors">+91 97988 81368</a>
                                </li>
                                <li className="flex items-center group/item cursor-pointer bg-white p-3 rounded-2xl border border-gray-100 hover:border-medical-300 hover:shadow-md transition-all duration-300">
                                    <span className="w-12 h-12 rounded-xl bg-medical-50 flex items-center justify-center mr-4 transition-colors duration-300 group-hover/item:bg-medical-600 group-hover/item:text-white text-medical-600">
                                        <i className="fas fa-envelope text-xl"></i>
                                    </span>
                                    <a href="mailto:newluckypharmacy@gmail.com" className="text-base font-bold text-gray-800 hover:text-medical-600 transition-colors truncate">newluckypharmacy@gmail.com</a>
                                </li>
                            </ul>
                        </div>
                        {/* Google Design Call Button (Green) */}
                        <a href="tel:+919798881368" className="mt-8 w-full py-4 bg-medical-600 hover:bg-medical-700 text-white font-bold text-lg text-center rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(34,197,94,0.3)] hover:shadow-[0_8px_30px_rgb(34,197,94,0.5)] flex items-center justify-center hover:-translate-y-1 relative z-10 overflow-hidden group/btn">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out rounded-2xl"></div>
                            <i className="fas fa-phone-alt mr-2 relative z-10"></i> <span className="relative z-10">Call Now</span>
                        </a>
                    </div>

                    {/* Box 2: Opening Hours */}
                    <div className="reveal reveal-delay-100 bg-gradient-to-br from-white to-blue-50 backdrop-blur-md border border-blue-100 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative z-10 animate-fade-in-up shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 group" style={{ animationDelay: '0.1s' }}>
                        <div className="absolute inset-0 bg-blue-600/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-blue-600 shadow-md border border-blue-100 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                                <i className="far fa-clock text-3xl"></i>
                            </div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Opening Hours</h3>
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 group-hover:border-blue-200 transition-colors shadow-sm group-hover:shadow-md">
                                    <p className="font-bold text-blue-600 mb-3 text-xs uppercase tracking-wider flex items-center"><i className="fas fa-calendar-alt mr-2 text-blue-400"></i> Mon - Sun (Except Fri)</p>
                                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                                        <span className="flex items-center font-medium"><i className="fas fa-sun text-yellow-500 mr-2 w-4"></i> Morning</span>
                                        <span className="font-bold text-gray-800 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">6:00 AM - 12:00 PM</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span className="flex items-center font-medium"><i className="fas fa-moon text-blue-400 mr-2 w-4"></i> Evening</span>
                                        <span className="font-bold text-gray-800 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">1:00 PM - 9:00 PM</span>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 group-hover:border-blue-200 transition-colors shadow-sm group-hover:shadow-md">
                                    <p className="font-bold text-blue-600 mb-3 text-xs uppercase tracking-wider flex items-center"><i className="fas fa-calendar-day mr-2 text-blue-400"></i> Friday</p>
                                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                                        <span className="flex items-center font-medium"><i className="fas fa-sun text-yellow-500 mr-2 w-4"></i> Morning</span>
                                        <span className="font-bold text-gray-800 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">6:00 AM - 12:00 PM</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span className="flex items-center font-medium"><i className="fas fa-moon text-blue-400 mr-2 w-4"></i> Evening</span>
                                        <span className="font-bold text-gray-800 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">2:00 PM - 9:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 bg-green-500/10 border border-green-200 text-green-700 py-3 px-4 rounded-2xl text-center font-bold text-sm flex items-center justify-center shadow-inner relative z-10 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                            <i className="fas fa-check-circle mr-2 text-lg"></i> Open 7 Days a Week
                        </div>
                    </div>

                    {/* Box 3: Send Prescription */}
                    <div className="reveal reveal-delay-200 bg-gradient-to-br from-white to-[#25D366]/5 backdrop-blur-md border border-[#25D366]/20 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden animate-fade-in-up shadow-xl hover:shadow-2xl hover:shadow-[#25D366]/20 group" style={{ animationDelay: '0.2s' }}>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#25D366]/10 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150 group-hover:rotate-12"></div>
                        <div className="absolute inset-0 bg-[#25D366]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-[#25D366] shadow-md border border-[#25D366]/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                <i className="fab fa-whatsapp text-4xl group-hover:animate-pulse"></i>
                            </div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Send Prescription</h3>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">Check medicine availability instantly. Just snap a photo and send it on WhatsApp.</p>
                        </div>
                        
                        <a href="https://wa.me/919798881368?text=Hello%20New%20Lucky%20Pharma,%20I%20would%20like%20to%20check%20the%20availability%20of%20medicines%20from%20this%20prescription." target="_blank" rel="noopener noreferrer" className="relative z-10 mt-auto w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg text-center rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgba(37,211,102,0.3)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.5)] flex items-center justify-center hover:-translate-y-1 overflow-hidden group/btn">
                             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out rounded-2xl"></div>
                            <i className="fab fa-whatsapp text-2xl mr-2 relative z-10"></i> <span className="relative z-10">Message Us</span>
                        </a>
                    </div>

                    {/* Box 4: Feedback */}
                    <div className="reveal reveal-delay-300 bg-gradient-to-br from-white to-yellow-50 backdrop-blur-md border border-yellow-100 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative z-10 animate-fade-in-up shadow-xl hover:shadow-2xl hover:shadow-yellow-500/20 group" style={{ animationDelay: '0.3s' }}>
                        <div className="absolute inset-0 bg-yellow-600/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-yellow-500 shadow-md border border-yellow-100 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                                <i className="fas fa-star text-3xl"></i>
                            </div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">We Value You</h3>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">Your feedback helps us serve the Hanwara community better. Tell us about your experience!</p>
                            
                            <div className="flex justify-center bg-white py-4 rounded-2xl border border-gray-100 text-yellow-400 text-3xl mb-8 space-x-2 group/stars shadow-sm">
                                <i className="fas fa-star group-hover/stars:scale-125 transition-transform duration-300 drop-shadow-sm group-hover/stars:rotate-[72deg]"></i>
                                <i className="fas fa-star group-hover/stars:scale-125 transition-transform duration-300 delay-75 drop-shadow-sm group-hover/stars:rotate-[72deg]"></i>
                                <i className="fas fa-star group-hover/stars:scale-125 transition-transform duration-300 delay-100 drop-shadow-sm group-hover/stars:rotate-[72deg]"></i>
                                <i className="fas fa-star group-hover/stars:scale-125 transition-transform duration-300 delay-150 drop-shadow-sm group-hover/stars:rotate-[72deg]"></i>
                                <i className="fas fa-star group-hover/stars:scale-125 transition-transform duration-300 delay-200 drop-shadow-sm group-hover/stars:rotate-[72deg]"></i>
                            </div>
                        </div>

                        <a href="https://www.google.com/search?q=New+Lucky+Pharma+Hanwara+Jharkhand" target="_blank" rel="noopener noreferrer" className="relative z-10 flex items-center justify-center w-full py-4 bg-white text-gray-800 border border-gray-200 font-bold text-lg rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-md group-hover:shadow-lg hover:-translate-y-1">
                            <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 12.01-2.19 15.98-5.96l-7.73-6c-2.15 1.45-4.92 2.3-8.25 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                            </svg>
                            Review on Google
                        </a>
                    </div>

                    {/* Box 5: Payment Modes */}
                    <div className="reveal reveal-delay-400 bg-gradient-to-br from-white to-purple-50 backdrop-blur-md border border-purple-100 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative z-10 animate-fade-in-up shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 group" style={{ animationDelay: '0.4s' }}>
                        <div className="absolute inset-0 bg-purple-600/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-purple-600 shadow-md border border-purple-100 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                <i className="fas fa-wallet text-3xl"></i>
                            </div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Easy Payments</h3>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">Pay securely at the store. We accept Cash and all major UPI apps.</p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center p-4 bg-white rounded-2xl border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all duration-300 group/cash">
                                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mr-4 transition-colors group-hover/cash:bg-green-500 group-hover/cash:text-white">
                                        <i className="fas fa-money-bill-wave text-xl"></i>
                                    </div>
                                    <span className="font-bold text-gray-800 text-lg text-green-700">Cash Accepted</span>
                                </div>

                                <div className="p-5 bg-white rounded-2xl border border-gray-100 group-hover:border-purple-300 group-hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors"></div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 relative z-10">Scan & Pay via</p>
                                    <div className="grid grid-cols-2 gap-3 relative z-10">
                                        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5 object-contain" />
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-5 object-contain" />
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-6 object-contain" />
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-4 object-contain" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Box 6: Authentic & Reliable */}
                    <div className="reveal reveal-delay-500 bg-gradient-to-br from-white to-teal-50 backdrop-blur-md border border-teal-100 rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative z-10 animate-fade-in-up shadow-xl hover:shadow-2xl hover:shadow-teal-500/20 group" style={{ animationDelay: '0.5s' }}>
                        <div className="absolute inset-0 bg-teal-600/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-teal-600 shadow-md border border-teal-100 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                <i className="fas fa-shield-alt text-3xl"></i>
                            </div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">100% Genuine</h3>
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">We source strictly from authorized distributors. Authentic, safe, and quality-assured medicines.</p>
                            
                            <ul className="space-y-4">
                                <li className="flex items-center text-gray-700 bg-white p-3 rounded-2xl border border-gray-100 group-hover:border-teal-200 transition-colors shadow-sm">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mr-3">
                                        <i className="fas fa-check-circle text-lg"></i>
                                    </div>
                                    <span className="font-bold">Authorized Brands</span>
                                </li>
                                <li className="flex items-center text-gray-700 bg-white p-3 rounded-2xl border border-gray-100 group-hover:border-teal-200 transition-colors shadow-sm">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mr-3">
                                        <i className="fas fa-temperature-low text-lg"></i>
                                    </div>
                                    <span className="font-bold">Optimal Storage</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Directions Section */}
                <div id="map-location" className="mt-16 sm:mt-24 scroll-mt-32">
                    <div className="text-center mb-10 reveal">
                        <div className="inline-flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-medium text-sm mb-4">
                            <i className="fas fa-map-marker-alt text-[#EA4335]"></i>
                            <span>Find Us</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight" style={{ color: '#202124', fontFamily: '"Google Sans", "Product Sans", sans-serif' }}>
                            Get directions
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Store Photo (Clickable Link) */}
                        <a 
                            href="https://www.google.com/search?q=New+Lucky+Pharma+Hanwara+Jharkhand" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="reveal block lg:col-span-1 bg-white rounded-3xl overflow-hidden hover-lift-smooth relative group h-full min-h-[300px] lg:min-h-[400px] cursor-pointer animate-fade-in-up border border-gray-200"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop" 
                                alt="Pharmacy Store Front" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent p-6">
                                <h3 className="text-white text-xl font-medium tracking-normal" style={{ fontFamily: '"Google Sans", "Product Sans", sans-serif' }}>Our Store Front</h3>
                                <p className="text-gray-300 text-sm font-normal mt-1">Main Road, Hanwara</p>
                                <div className="mt-3 inline-flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span>View on Google Maps</span>
                                    <i className="fas fa-external-link-alt ml-2 text-xs"></i>
                                </div>
                            </div>
                        </a>

                        {/* Map - Spans 2 Cols on Large Screens */}
                        <div className="reveal reveal-delay-200 lg:col-span-2 flex flex-col rounded-3xl overflow-hidden glass-panel hover-lift-smooth relative group animate-fade-in-up border-4 border-white">
                            <div className="w-full h-[300px] lg:h-full min-h-[300px] relative">
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    id="gmap_canvas" 
                                    src="https://maps.google.com/maps?q=New%20Lucky%20Pharma%2C%20Hanwara%2C%20Jharkhand&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                                    frameBorder="0" 
                                    scrolling="no" 
                                    marginHeight={0} 
                                    marginWidth={0}
                                    className="w-full h-full bg-gray-200 absolute inset-0"
                                    style={{ filter: 'contrast(1.1)' }}
                                    allowFullScreen={true}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Map"
                                >
                                </iframe>
                            </div>
                            
                            <div className="p-4 bg-medical-50/50 backdrop-blur-sm border-t border-white/40 flex justify-center sticky bottom-0">
                                <a 
                                    href="https://www.google.com/maps/dir/?api=1&destination=New+Lucky+Pharma+Hanwara+Jharkhand" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="w-full sm:w-auto bg-medical-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg hover:bg-medical-700 transition-all duration-300 hover:scale-105 flex items-center justify-center border-none btn-shine whitespace-nowrap"
                                >

                                <i className="fas fa-directions mr-2 text-xl"></i> Get Directions on Google Maps
                            </a>
                        </div>
                    </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;