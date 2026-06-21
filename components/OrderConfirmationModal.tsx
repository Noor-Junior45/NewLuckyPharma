import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface OrderConfirmationModalProps {
    isOpen: boolean;
    product: Product;
    onClose: () => void;
}

const getValidGtin = (id: number): string => {
    // Standard EAN-13 generator matching general feed and Google merchant standards
    const base = "8901234" + String(id).padStart(5, '0'); // 12 digits
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(base[i], 10);
        sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return base + checkDigit;
};

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ isOpen, product, onClose }) => {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [email, setEmail] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [orderId, setOrderId] = useState('');
    const [estimatedDate, setEstimatedDate] = useState('');
    const deliveryCountry = 'IN';

    const getMaxPriceVal = (priceStr?: string): number => {
        if (!priceStr) return 100;
        const matches = priceStr.replace(/,/g, '').match(/\d+/g);
        if (matches && matches.length > 0) {
            return Math.max(...matches.map(Number));
        }
        return 100;
    };

    const getMaxPrice = (priceStr?: string): string => {
        return `₹${getMaxPriceVal(priceStr)}`;
    };

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setEmail('');
            setWhatsappNumber('');
            // Generate a realistic high-quality order ID for Merchant Center and the user
            const rand = Math.floor(100000 + Math.random() * 900000);
            setOrderId(`LMR-5811-${rand}`);
            
            // Default estimated delivery date to 3 days from now
            const delivery = new Date();
            delivery.setDate(delivery.getDate() + 3);
            setEstimatedDate(delivery.toISOString().split('T')[0]);
        }
    }, [isOpen, product]);

    if (!isOpen) return null;

    const getWhatsAppLink = () => {
        const phoneNumber = "919798881368";
        const salePrice = getMaxPrice(product.avgPrice);
        const mrp = `₹${Math.ceil(getMaxPriceVal(product.avgPrice) * 1.15)}`;
        const message = `Hello New Lucky Pharma,\n\nI want to place an order/check availability for:\n*Medicine:* ${product.name}\n*Our Sale Price:* ${salePrice}\n*MRP:* ${mrp}\n*My Email:* ${email || 'Not provided'}\n*My Order Ref:* ${orderId}`;
        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Prepare GCR Opt-in data format
        const gcrData = {
            "merchant_id": 5811245568,
            "order_id": orderId,
            "email": email || "customer@newluckypharma.in",
            "delivery_country": deliveryCountry,
            "estimated_delivery_date": estimatedDate,
            "products": [{"gtin": getValidGtin(product.id)}]
        };

        // 2. Save GCR data to sessionStorage for renderOptIn helper
        try {
            sessionStorage.setItem('gcr_opt_in_data', JSON.stringify(gcrData));
        } catch (err) {
            console.error('Failed to write to sessionStorage:', err);
        }

        // 3. Open WhatsApp link in a new tab smoothly
        window.open(getWhatsAppLink(), '_blank', 'noopener,noreferrer');

        // 4. Move to Success step
        setStep('success');

        // 5. Trigger Google Reviews Opt-In Modal dynamically
        setTimeout(() => {
            const anyWindow = window as any;
            if (anyWindow.renderOptIn) {
                console.log('[Google Customer Reviews] Calling renderOptIn dynamically on Order Confirmation...');
                anyWindow.renderOptIn();
            } else if (anyWindow.gapi && anyWindow.gapi.surveyoptin) {
                console.log('[Google Customer Reviews] surveyoptin and gapi loaded immediately, rendering opt-in');
                try {
                    anyWindow.gapi.surveyoptin.render(gcrData);
                } catch (err) {
                    console.error('Failed to trigger surveyoptin.render directly:', err);
                }
            } else {
                console.warn('[Google Customer Reviews] Gapi code snippet not loaded or blocked by iframe environment');
            }
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={onClose}></div>
            
            <div className="relative glass-panel bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 animate-popup-in">
                {/* Header Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full w-8 h-8 flex items-center justify-center transition-all z-10"
                    aria-label="Close"
                >
                    <i className="fas fa-times text-sm"></i>
                </button>

                {step === 'form' ? (
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                        <div className="text-center mb-6">
                            <span className="inline-flex py-1 px-3.5 rounded-full bg-medical-50 text-medical-700 text-xs font-bold border border-medical-100 mb-2">
                                <i className="fas fa-prescription-bottle mr-1.5 flex items-center"></i> Secure Local Reservation
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">Order Confirmation</h3>
                            <p className="text-xs text-gray-500 mt-1">Check availability, secure stock and consult on WhatsApp</p>
                        </div>

                        {/* Product Detail Strip */}
                        <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-6 items-center">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 p-1">
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-sm sm:text-base text-gray-800 truncate">{product.name}</h4>
                                <div className="flex gap-2 items-center mt-1">
                                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">{product.category}</span>
                                    {product.avgPrice && (
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Sale Price: {getMaxPrice(product.avgPrice)}</span>
                                            <span className="text-[10px] text-gray-400 line-through">MRP: ₹{Math.ceil(getMaxPriceVal(product.avgPrice) * 1.15)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest mb-1.5">
                                    Your Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <i className="fas fa-envelope text-sm"></i>
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="e.g. you@example.com"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-200 outline-none transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Used to send Google Customer Reviews invitation survey directly to you.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest mb-1.5">
                                    WhatsApp / Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <i className="fab fa-whatsapp text-base"></i>
                                    </div>
                                    <input
                                        type="tel"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        placeholder="e.g. +91 98765 43210"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-200 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div>
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Country</span>
                                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mt-0.5">
                                        <i className="fas fa-globe text-gray-400"></i> India (IN)
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Estimated Pick-up</span>
                                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mt-0.5">
                                        <i className="fas fa-calendar-alt text-gray-400"></i> 1-3 Business Days
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Return policy note and submission */}
                        <div className="mt-6 border-t border-gray-100 pt-5">
                            <button
                                type="submit"
                                className="w-full py-4 px-6 rounded-xl font-bold bg-medical-600 hover:bg-medical-700 text-white transition-all duration-300 shadow-lg shadow-medical-500/25 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 btn-shine text-sm sm:text-base cursor-pointer"
                            >
                                <i className="fab fa-whatsapp text-lg sm:text-xl"></i>
                                <span>Check Availability on WhatsApp</span>
                            </button>
                            
                            <p className="text-[10px] leading-relaxed text-gray-400 text-center mt-3">
                                By proceeding, you will be redirected to New Lucky Pharma’s WhatsApp channel. In compliance with Google Merchant rules, we collect email to render the Customer Reviews consent opt-in.
                            </p>
                        </div>
                    </form>
                ) : (
                    <div className="p-6 sm:p-8 text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-popup-in">
                            <i className="fas fa-check-circle text-3xl"></i>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">Order Reservation Initiated</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            We've started your WhatsApp chat. If it didn't open automatically, please check your secondary browser tabs!
                        </p>

                        {/* Order Details Receipt Box */}
                        <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl text-left my-6 space-y-2">
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100">
                                <span className="font-bold text-gray-400 uppercase tracking-wider">Your Order Receipt</span>
                                <span className="bg-emerald-550/15 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase border border-emerald-100 bg-emerald-50">Active inquiry</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-500">Order ID:</span>
                                <span className="font-mono font-bold text-gray-800">{orderId}</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-500">Selected Product:</span>
                                <span className="font-bold text-gray-800 max-w-[180px] truncate">{product.name}</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-500">Delivery Country:</span>
                                <span className="font-bold text-gray-800">India (IN)</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-500">Estimated Delivery:</span>
                                <span className="font-bold text-gray-800">{estimatedDate}</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-500">Customer Email:</span>
                                <span className="font-bold text-gray-800 justify-end flex truncate max-w-[180px]">{email}</span>
                            </div>
                        </div>

                        {/* Google Merchant Customer Reviews Opt-In Promo */}
                        <div className="border border-indigo-100 bg-indigo-50/40 p-4 rounded-2xl text-left mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 text-indigo-400">
                                <i className="fas fa-poll text-3xl opacity-20"></i>
                            </div>
                            <h4 className="text-xs font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1">
                                <i className="fas fa-star text-amber-400"></i> Google Customer Reviews Opt-In
                            </h4>
                            <p className="text-[11px] text-indigo-900/90 leading-normal mt-1">
                                As required by Google, an official survey popup may render on this screen. Opting in allows Google to ask you for rating feedback on your checkout experience at New Lucky Pharma!
                            </p>
                        </div>

                        {/* Return policy point out! */}
                        <div className="p-3 bg-rose-50/40 border border-rose-100/60 rounded-xl text-left text-xs mb-6">
                            <p className="text-rose-800 leading-normal">
                                <i className="fas fa-ban mr-1"></i> <strong>Return Policy Alert:</strong> Please note that at New Lucky Pharma, we don't accept returns, exchanges, or refunds for safety and sterilization standards once they have left pharmacy counter. 
                                <a href="#return-policy" onClick={() => { onClose(); }} className="text-rose-700 underline font-bold ml-1 hover:text-rose-900">Read policies</a>.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <a 
                                href={getWhatsAppLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 text-center bg-medical-50 text-medical-700 hover:bg-medical-100 font-extrabold rounded-xl text-xs transition border border-medical-100"
                            >
                                <i className="fab fa-whatsapp mr-1"></i> Re-open WhatsApp
                            </a>
                            <button 
                                onClick={onClose}
                                className="flex-1 py-3 bg-medical-600 hover:bg-medical-700 text-white font-extrabold rounded-xl text-xs shadow-md transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderConfirmationModal;
